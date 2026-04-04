import { Prisma } from '@prisma/client';
import prisma from '../../config/db';
import { addMinutes } from 'date-fns';
import { UserDetails, UserDetailsInput } from '../../models/UserDetails';
import { ZohoEmailService, BookingEmailData } from '../../services/ZohoEmailService';
import { PricingService } from '../pricing/pricing.service';

export class BookingService {
    private emailService: ZohoEmailService;
    private pricingService: PricingService;

    constructor() {
        this.emailService = new ZohoEmailService(prisma);
        this.pricingService = new PricingService();
    }
    /**
     * Create a temporary hold on a slot.
     * STRICT: Uses Serializable isolation to prevent race conditions.
     */
    async createHold(
        studioIdOrSlug: string,
        startDatetime: Date,
        endDatetime: Date
    ) {
        // Transaction with Serializable isolation
        return await prisma.$transaction(async (tx) => {
            // 0. Resolve studio ID from slug if needed
            let studioId: string;
            
            if (studioIdOrSlug.includes('-') && studioIdOrSlug.length > 20) {
                // Likely a UUID
                studioId = studioIdOrSlug;
            } else {
                // Likely a slug, resolve to UUID
                const studio = await tx.studio.findUnique({
                    where: { slug: studioIdOrSlug }
                });
                if (!studio) throw new Error('Studio not found');
                studioId = studio.id;
            }
            // 1. Check for overlapping Bookings
            const existingBooking = await tx.booking.findFirst({
                where: {
                    studio_id: studioId,
                    status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
                    // Overlap check: (StartA < EndB) and (EndA > StartB)
                    start_datetime: { lt: endDatetime },
                    end_datetime: { gt: startDatetime },
                },
            });

            if (existingBooking) {
                throw new Error('Slot is already booked');
            }

            // 2. Check for overlapping Locks
            const existingLock = await tx.bookingLock.findFirst({
                where: {
                    studio_id: studioId,
                    expires_at: { gt: new Date() }, // Active locks
                    start_datetime: { lt: endDatetime },
                    end_datetime: { gt: startDatetime },
                },
            });

            if (existingLock) {
                throw new Error('Slot is temporarily held by another user');
            }

            // 3. Check for Blackouts
            const blackout = await tx.blackoutPeriod.findFirst({
                where: {
                    studio_id: studioId,
                    start_datetime: { lt: endDatetime },
                    end_datetime: { gt: startDatetime },
                },
            });

            if (blackout) {
                throw new Error('Slot is unavailable (blackout)');
            }

            // 4. Create proper Lock
            const expiresAt = addMinutes(new Date(), 10); // 10 min hold
            const lock = await tx.bookingLock.create({
                data: {
                    studio_id: studioId,
                    start_datetime: startDatetime,
                    end_datetime: endDatetime,
                    expires_at: expiresAt,
                },
            });

            // Calculate pricing
            const price = await this.pricingService.calculatePrice(studioId, startDatetime, endDatetime);

            return {
                lock_token: lock.lock_token,
                expires_at: lock.expires_at,
                pricing_preview: price
            };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            maxWait: 10000, // Wait up to 10s for lock
            timeout: 30000  // Allow up to 30s total transaction time
        });
    }

    /**
     * Confirm a booking using a lock token with user details
     */
    async confirmBooking(
        lockToken: string,
        userId: string | null,
        userDetails: UserDetailsInput,
        paymentIntentId: string,
        finalPrice: number
    ) {
        try {
            return await prisma.$transaction(async (tx) => {
                // 1. Validate Lock
                const lock = await tx.bookingLock.findUnique({
                    where: { lock_token: lockToken }
                });

                if (!lock) throw new Error('Invalid lock token');
                if (lock.expires_at < new Date()) throw new Error('Lock expired');

                // 2. Validate and store user details
                const userDetailsModel = new UserDetails(userDetails);
                const validation = userDetailsModel.validate();
                if (!validation.isValid) {
                    const errorMsgs = Object.values(validation.errors).join(', ');
                    throw new Error(`Invalid user details: ${errorMsgs}`);
                }

                const sanitizedUserDetails = userDetailsModel.sanitize();

                // 2a. Find or create User record by email
                let user = await tx.user.findFirst({
                    where: { email: sanitizedUserDetails.email }
                });

                if (!user) {
                    user = await tx.user.create({
                        data: {
                            email: sanitizedUserDetails.email,
                            phone: sanitizedUserDetails.phone,
                            role: 'CUSTOMER',
                        },
                    });
                } else {
                    // Update phone if changed
                    if (sanitizedUserDetails.phone && sanitizedUserDetails.phone !== user.phone) {
                        user = await tx.user.update({
                            where: { id: user.id },
                            data: { phone: sanitizedUserDetails.phone }
                        }) as any;
                    }
                }

                // 2b. Create UserDetails record (new entry each booking)
                const dbData = {
                    full_name: sanitizedUserDetails.fullName,
                    email: sanitizedUserDetails.email,
                    phone: sanitizedUserDetails.phone,
                    company: sanitizedUserDetails.company || null,
                    special_requirements: sanitizedUserDetails.specialRequirements || null
                };

                const userDetailsRecord = await tx.userDetails.create({
                    data: dbData
                });

                // 3. Create Booking (without payment for now - simplify)
                const booking = await tx.booking.create({
                    data: {
                        studio_id: lock.studio_id,
                        user_id: user.id, // Link to the user we just found/created
                        user_details_id: userDetailsRecord.id,
                        status: 'CONFIRMED',
                        start_datetime: lock.start_datetime,
                        end_datetime: lock.end_datetime,
                        timezone: 'UTC',
                        total_price: new Prisma.Decimal(finalPrice),
                        pricing_snapshot: {},
                        email_status: 'pending'
                    },
                    include: {
                        studio: true,
                        user_details: true
                    }
                });

                // 4. Delete/Consume Lock
                await tx.bookingLock.delete({
                    where: { id: lock.id }
                });

                return booking;
            });
        } catch (error: any) {
            console.error('Transaction error in confirmBooking:', {
                message: error.message,
                stack: error.stack,
                code: error.code,
                meta: error.meta
            });

            // Handle specific Prisma errors
            if (error.code === 'P2002') {
                throw new Error('A booking for this time slot already exists. Please try again.');
            } else if (error.code === 'P2003') {
                throw new Error('Invalid studio or user reference. Please contact support.');
            } else if (error.code === 'P2009') {
                throw new Error('Invalid price format. Please try again.');
            } else {
                throw error;
            }
        }
    }

    /**
     * Send confirmation email asynchronously (public for external calls)
     */
    async sendConfirmationEmailAsync(booking: any): Promise<void> {
        try {
            const emailData: BookingEmailData = {
                bookingId: booking.id,
                confirmationNumber: booking.id.substring(0, 8).toUpperCase(),
                studioName: booking.studio.name,
                date: booking.start_datetime.toLocaleDateString(),
                time: booking.start_datetime.toLocaleTimeString(),
                duration: `${Math.round((booking.end_datetime.getTime() - booking.start_datetime.getTime()) / (1000 * 60 * 60))} hours`,
                totalCost: `$${booking.total_price}`,
                userDetails: {
                    fullName: booking.user_details.full_name,
                    email: booking.user_details.email,
                    phone: booking.user_details.phone,
                    company: booking.user_details.company
                }
            };

            const result = await this.emailService.sendConfirmationEmail(emailData);
            
            // Update booking email status
            await prisma.booking.update({
                where: { id: booking.id },
                data: {
                    email_status: result.success ? 'sent' : 'failed',
                    email_sent_at: result.success ? new Date() : null,
                    email_message_id: result.messageId
                }
            });

            // Retry failed emails if retryable
            if (!result.success && result.retryable) {
                setTimeout(() => {
                    this.retryEmailDelivery(booking.id);
                }, 5000);
            }
        } catch (error) {
            console.error('Email sending failed:', error);
            await prisma.booking.update({
                where: { id: booking.id },
                data: { email_status: 'failed' }
            });
        }
    }

    /**
     * Retry email delivery for failed emails
     */
    private async retryEmailDelivery(bookingId: string): Promise<void> {
        try {
            const emailLog = await prisma.emailLog.findFirst({
                where: { 
                    booking_id: bookingId,
                    status: 'failed',
                    retry_count: { lt: 3 }
                },
                orderBy: { created_at: 'desc' }
            });

            if (emailLog) {
                await this.emailService.retryFailedEmail(emailLog.id);
            }
        } catch (error) {
            console.error('Email retry failed:', error);
        }
    }

    /**
     * Get booking details with user information
     */
    async getBookingDetails(bookingId: string) {
        return await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                studio: true,
                user_details: true,
                payments: true,
                email_logs: true
            }
        });
    }
}
