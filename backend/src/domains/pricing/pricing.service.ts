import prisma from '../../config/db';
import { differenceInMinutes } from 'date-fns';

export class PricingService {
    /**
     * Calculate price for a booking duration based on studio rules
     * Supports: HOURLY, HALF_DAY, FULL_DAY, PEAK_HOUR, WEEKEND, SEASONAL
     *
     * Pricing Logic:
     * - Rules are evaluated in priority order (highest first)
     * - First matching rule wins and its price is applied
     * - If no rule matches, returns error
     *
     * @throws Error if no pricing rule matches the booking
     */
    async calculatePrice(studioIdOrSlug: string, start: Date, end: Date) {
        // 0. Resolve studio ID from slug if needed
        let studioId: string;

        if (studioIdOrSlug.includes('-') && studioIdOrSlug.length > 20) {
            // Likely a UUID
            studioId = studioIdOrSlug;
        } else {
            // Likely a slug, resolve to UUID
            const studio = await prisma.studio.findUnique({
                where: { slug: studioIdOrSlug }
            });
            if (!studio) throw new Error('Studio not found');
            studioId = studio.id;
        }

        // 1. Fetch rules sorted by priority (desc)
        const rules = await prisma.pricingRule.findMany({
            where: { studio_id: studioId },
            orderBy: { priority: 'desc' }
        });

        const durationMinutes = differenceInMinutes(end, start);
        const durationHours = durationMinutes / 60;

        if (rules.length === 0) {
            // Fallback: use studio's base price as hourly rate
            const studio = await prisma.studio.findUnique({ where: { id: studioId } });
            if (!studio || !studio.price) {
                throw new Error('No pricing configured for this studio. Please set a price in the admin panel.');
            }
            const price = Number(studio.price) * durationHours;
            return {
                total: Math.round(price),
                currency: 'INR',
                snapshot: {
                    applied_rule_id: 'base_price',
                    rule_type: 'HOURLY',
                    base_price: Number(studio.price),
                    duration_hours: durationHours,
                    matched_conditions: { day_of_week: null, time_range: null }
                }
            };
        }

        // 2. Evaluate rules in priority order
        for (const rule of rules) {
            const matches = this.matchesRule(rule, start, end, durationMinutes, durationHours);

            if (matches) {
                const price = this.calculateRulePrice(rule, durationMinutes, durationHours);

                return {
                    total: price,
                    currency: rule.currency,
                    snapshot: {
                        applied_rule_id: rule.id,
                        rule_type: rule.rule_type,
                        base_price: Number(rule.price),
                        duration_hours: durationHours,
                        matched_conditions: {
                            day_of_week: rule.day_of_week,
                            time_range: rule.start_time && rule.end_time ? `${rule.start_time}-${rule.end_time}` : null,
                        }
                    }
                };
            }
        }

        // No rule matched — fall back to studio base price
        const studio = await prisma.studio.findUnique({ where: { id: studioId } });
        if (studio?.price) {
            const price = Number(studio.price) * durationHours;
            return {
                total: Math.round(price),
                currency: 'INR',
                snapshot: {
                    applied_rule_id: 'base_price_fallback',
                    rule_type: 'HOURLY',
                    base_price: Number(studio.price),
                    duration_hours: durationHours,
                    matched_conditions: { day_of_week: null, time_range: null }
                }
            };
        }
        throw new Error('No pricing configured for this studio. Please set a price in the admin panel.');
    }

    /**
     * Check if a pricing rule applies to the given booking
     */
    private matchesRule(rule: any, start: Date, end: Date, durationMinutes: number, durationHours: number): boolean {
        switch (rule.rule_type) {
            case 'HOURLY':
                // HOURLY applies to any duration
                return true;

            case 'HALF_DAY':
                // HALF_DAY: 4-8 hours
                return durationHours >= 4 && durationHours < 8;

            case 'FULL_DAY':
                // FULL_DAY: 8+ hours
                return durationHours >= 8;

            case 'PEAK_HOUR':
                // PEAK_HOUR: Check if booking overlaps with peak time window
                if (!rule.start_time || !rule.end_time) {
                    console.warn(`PEAK_HOUR rule ${rule.id} missing time range`);
                    return false;
                }
                return this.bookingOverlapsTimeWindow(start, end, rule.start_time, rule.end_time, rule.day_of_week);

            case 'WEEKEND':
                // WEEKEND: Check if booking is on weekend (Saturday=6, Sunday=0)
                const dayOfWeek = start.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                // Also check if specific day_of_week is set on rule
                if (rule.day_of_week !== null && rule.day_of_week !== undefined) {
                    return dayOfWeek === rule.day_of_week;
                }

                return isWeekend;

            case 'SEASONAL':
                // SEASONAL: Check if booking date is within a season range
                // For simplicity, we'll check month/day ranges
                // In production, you'd have a Season model with start_date/end_date
                if (!rule.start_time || !rule.end_time) {
                    console.warn(`SEASONAL rule ${rule.id} missing date range`);
                    return false;
                }
                // Parse as MM-DD format
                const seasonStartMonth = parseInt(rule.start_time.substring(0, 2));
                const seasonStartDay = parseInt(rule.start_time.substring(3, 5));
                const seasonEndMonth = parseInt(rule.end_time.substring(0, 2));
                const seasonEndDay = parseInt(rule.end_time.substring(3, 5));

                const bookingMonth = start.getMonth() + 1; // 1-12
                const bookingDay = start.getDate();

                // Simple date range check (handles year wrap)
                return this.isDateInRange(bookingMonth, bookingDay, seasonStartMonth, seasonStartDay, seasonEndMonth, seasonEndDay);

            default:
                console.warn(`Unknown rule type: ${rule.rule_type}`);
                return false;
        }
    }

    /**
     * Calculate price based on rule type and duration
     */
    private calculateRulePrice(rule: any, durationMinutes: number, durationHours: number): number {
        const basePrice = Number(rule.price);

        switch (rule.rule_type) {
            case 'HOURLY':
                return basePrice * durationHours;

            case 'HALF_DAY':
                // Flat rate for half day (4-8 hours)
                return basePrice;

            case 'FULL_DAY':
                // Flat rate for full day (8+ hours)
                return basePrice;

            case 'PEAK_HOUR':
                // Could be multiplier or flat rate. Using multiplier for now.
                // If multiplier is stored in a separate field, use it.
                // For now, basePrice is the peak hour rate (per hour)
                return basePrice * durationHours;

            case 'WEEKEND':
                // Weekend could be flat rate or hourly multiplier
                return basePrice * durationHours;

            case 'SEASONAL':
                // Seasonal rate could be flat or hourly
                if (durationHours > 1) {
                    return basePrice * durationHours;
                }
                return basePrice;

            default:
                return basePrice * durationHours;
        }
    }

    /**
     * Check if a booking overlaps with a time window (e.g., 14:00-18:00)
     */
    private bookingOverlapsTimeWindow(start: Date, end: Date, windowStart: string, windowEnd: string, dayOfWeekRule?: number): boolean {
        try {
            const day = start.getDay();

            // Check day of week if specified
            if (dayOfWeekRule !== null && dayOfWeekRule !== undefined && day !== dayOfWeekRule) {
                return false;
            }

            // Parse time window (HH:mm format)
            const [startHour, startMin] = windowStart.split(':').map(Number);
            const [endHour, endMin] = windowEnd.split(':').map(Number);

            const windowStartDate = new Date(start);
            windowStartDate.setHours(startHour, startMin, 0, 0);

            const windowEndDate = new Date(start);
            windowEndDate.setHours(endHour, endMin, 0, 0);

            // Check if booking overlaps with window
            // Overlap exists if: (StartA < EndB) and (EndA > StartB)
            return start < windowEndDate && end > windowStartDate;
        } catch (error) {
            console.error('Error checking time window overlap:', error);
            return false;
        }
    }

    /**
     * Check if a date (month/day) falls within a range (handles year wrap)
     */
    private isDateInRange(
        bookingMonth: number, bookingDay: number,
        startMonth: number, startDay: number,
        endMonth: number, endDay: number
    ): boolean {
        // Convert to day-of-year for comparison (simplified, ignores leap years)
        const bookingDayOfYear = this.dayOfYear(bookingMonth, bookingDay);
        const startDayOfYear = this.dayOfYear(startMonth, startDay);
        const endDayOfYear = this.dayOfYear(endMonth, endDay);

        if (startDayOfYear <= endDayOfYear) {
            // Range doesn't wrap year: Jan 15 - Mar 15
            return bookingDayOfYear >= startDayOfYear && bookingDayOfYear <= endDayOfYear;
        } else {
            // Range wraps year: Dec 15 - Jan 15
            return bookingDayOfYear >= startDayOfYear || bookingDayOfYear <= endDayOfYear;
        }
    }

    /**
     * Calculate day of year (1-365)
     */
    private dayOfYear(month: number, day: number): number {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let dayOfYear = day;

        for (let i = 0; i < month - 1; i++) {
            dayOfYear += daysInMonth[i];
        }

        return dayOfYear;
    }
}
