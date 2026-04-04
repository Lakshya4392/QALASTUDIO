import prisma from '../../config/db';
import { isOverlapping } from '../../utils/date.utils';
import { addDays, parse } from 'date-fns';

export class AvailabilityService {
    /**
     * Fetch available slots for a studio within a date range
     */
    async getAvailability(studioIdOrSlug: string, startDate: Date, endDate: Date) {
        // 1. Fetch Studio settings (min duration, buffer) - handle both UUID and slug
        let studio;
        
        // Check if it's a UUID (contains hyphens) or a slug
        if (studioIdOrSlug.includes('-') && studioIdOrSlug.length > 20) {
            // Likely a UUID
            studio = await prisma.studio.findUnique({
                where: { id: studioIdOrSlug },
                include: { availability_rules: true },
            });
        } else {
            // Likely a slug
            studio = await prisma.studio.findUnique({
                where: { slug: studioIdOrSlug },
                include: { availability_rules: true },
            });
        }

        if (!studio) throw new Error('Studio not found');
        
        const studioId = studio.id; // Use the actual UUID for subsequent queries

        // 2. Fetch all blocking events
        const [blackouts, confirmedBookings, activeLocks] = await Promise.all([
            prisma.blackoutPeriod.findMany({
                where: {
                    studio_id: studioId,
                    end_datetime: { gte: startDate },
                    start_datetime: { lte: endDate },
                },
            }),
            prisma.booking.findMany({
                where: {
                    studio_id: studioId,
                    status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] }, // Pending payment blocks slot too? Or just Hold?
                    end_datetime: { gte: startDate },
                    start_datetime: { lte: endDate },
                },
            }),
            prisma.bookingLock.findMany({
                where: {
                    studio_id: studioId,
                    expires_at: { gt: new Date() }, // Only active locks
                    end_datetime: { gte: startDate },
                    start_datetime: { lte: endDate },
                },
            }),
        ]);

        // 3. Generate potential slots based on rules
        const slots: { start: string; end: string }[] = [];
        const days = [];
        let current = new Date(startDate);
        while (current <= endDate) {
            days.push(new Date(current));
            current = addDays(current, 1);
        }

        for (const day of days) {
            const dayOfWeek = day.getDay(); // 0-6
            const rule = studio.availability_rules.find((r) => r.day_of_week === dayOfWeek && r.is_active);

            if (rule) {
                // Parse start and end times for this day
                const dayStart = parse(rule.start_time, 'HH:mm', day);
                const dayEnd = parse(rule.end_time, 'HH:mm', day);

                // This is a simplified "whole day available" check.
                // A real system would slice this range by the blocks.
                // For now, checks if the request fits.
                // But for "getAvailability", usually we return chunks or "isAvailable".

                // Let's implement creating granular slots? Or just return the "Free Ranges".
                // Returning Free Ranges is better.

                let freeRanges = [{ start: dayStart, end: dayEnd }];

                // Subtract blocks
                const blocks = [
                    ...blackouts.map(b => ({ start: b.start_datetime, end: b.end_datetime })),
                    ...confirmedBookings.map(b => ({ start: b.start_datetime, end: b.end_datetime })),
                    ...activeLocks.map(l => ({ start: l.start_datetime, end: l.end_datetime }))
                ];

                // Sort blocks by start time
                blocks.sort((a, b) => a.start.getTime() - b.start.getTime());

                for (const block of blocks) {
                    const nextFreeRanges = [];
                    for (const range of freeRanges) {
                        // No overlap
                        if (!isOverlapping(range.start, range.end, block.start, block.end)) {
                            nextFreeRanges.push(range);
                            continue;
                        }

                        // If block starts after range start, keep the head
                        if (block.start > range.start) {
                            nextFreeRanges.push({ start: range.start, end: block.start });
                        }

                        // If block ends before range end, keep the tail
                        if (block.end < range.end) {
                            nextFreeRanges.push({ start: block.end, end: range.end });
                        }
                    }
                    freeRanges = nextFreeRanges;
                }

                // Filter out ranges smaller than min booking duration
                const minMs = studio.min_booking_duration_minutes * 60 * 1000;
                const validRanges = freeRanges.filter(r => r.end.getTime() - r.start.getTime() >= minMs);

                validRanges.forEach(r => {
                    slots.push({
                        start: r.start.toISOString(),
                        end: r.end.toISOString()
                    });
                });
            }
        }

        return slots;
    }
}
