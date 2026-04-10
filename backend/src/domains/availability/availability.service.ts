import prisma from '../../config/db';
import { isOverlapping } from '../../utils/date.utils';
import { addDays, parse } from 'date-fns';

export class AvailabilityService {
    async getAvailability(studioIdOrSlug: string, startDate: Date, endDate: Date) {
        let studio;

        // Try UUID first (contains hyphens and long)
        if (studioIdOrSlug.includes('-') && studioIdOrSlug.length > 20) {
            studio = await prisma.studio.findUnique({
                where: { id: studioIdOrSlug },
                include: { availability_rules: true },
            });
        }

        // Try slug
        if (!studio) {
            studio = await prisma.studio.findUnique({
                where: { slug: studioIdOrSlug },
                include: { availability_rules: true },
            }).catch(() => null);
        }

        // Try by order (integer ID from old frontend code)
        if (!studio && /^\d+$/.test(studioIdOrSlug)) {
            studio = await prisma.studio.findFirst({
                where: { order: parseInt(studioIdOrSlug), is_active: true },
                include: { availability_rules: true },
            });
        }

        // Last resort — first active studio
        if (!studio) {
            studio = await prisma.studio.findFirst({
                where: { is_active: true },
                include: { availability_rules: true },
                orderBy: { order: 'asc' },
            });
        }

        if (!studio) throw new Error('Studio not found');

        const studioId = studio.id;

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
                    status: { in: ['CONFIRMED', 'PENDING_PAYMENT', 'HOLD'] },
                    end_datetime: { gte: startDate },
                    start_datetime: { lte: endDate },
                },
            }),
            prisma.bookingLock.findMany({
                where: {
                    studio_id: studioId,
                    expires_at: { gt: new Date() },
                    end_datetime: { gte: startDate },
                    start_datetime: { lte: endDate },
                },
            }),
        ]);

        const slots: { start: string; end: string }[] = [];
        const days: Date[] = [];
        let current = new Date(startDate);
        while (current <= endDate) {
            days.push(new Date(current));
            current = addDays(current, 1);
        }

        for (const day of days) {
            const dayOfWeek = day.getDay();
            const rule = studio.availability_rules.find(
                (r) => r.day_of_week === dayOfWeek && r.is_active
            );
            if (!rule) continue;

            let dayStart = parse(rule.start_time, 'HH:mm', day);
            let dayEnd = parse(rule.end_time, 'HH:mm', day);

            // Handle midnight/end-of-day edge case
            if (rule.end_time === '00:00' || rule.end_time === '24:00' || rule.end_time === '00:00:00') {
                dayEnd = new Date(day);
                dayEnd.setHours(23, 59, 59, 999);
            } else if (dayEnd <= dayStart) {
                // If end time is before start time, it likely means next day
                dayEnd = addDays(dayEnd, 1);
            }

            let freeRanges = [{ start: dayStart, end: dayEnd }];

            const blocks = [
                ...blackouts.map(b => ({ start: b.start_datetime, end: b.end_datetime })),
                ...confirmedBookings.map(b => ({ start: b.start_datetime, end: b.end_datetime })),
                ...activeLocks.map(l => ({ start: l.start_datetime, end: l.end_datetime })),
            ].sort((a, b) => a.start.getTime() - b.start.getTime());

            for (const block of blocks) {
                const next: { start: Date; end: Date }[] = [];
                for (const range of freeRanges) {
                    if (!isOverlapping(range.start, range.end, block.start, block.end)) {
                        next.push(range);
                        continue;
                    }
                    if (block.start > range.start) next.push({ start: range.start, end: block.start });
                    if (block.end < range.end) next.push({ start: block.end, end: range.end });
                }
                freeRanges = next;
            }

            const minMs = studio.min_booking_duration_minutes * 60 * 1000;
            freeRanges
                .filter(r => r.end.getTime() - r.start.getTime() >= minMs)
                .forEach(r => slots.push({ start: r.start.toISOString(), end: r.end.toISOString() }));
        }

        return slots;
    }
}
