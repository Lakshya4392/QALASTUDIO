import { isBefore, isAfter } from 'date-fns';

export const isOverlapping = (
    startA: Date,
    endA: Date,
    startB: Date,
    endB: Date
): boolean => {
    // (StartA < EndB) and (EndA > StartB)
    return isBefore(startA, endB) && isAfter(endA, startB);
};

export const normalizeDate = (date: Date): Date => {
    // Ensure zero milliseconds for consistent comparison
    const d = new Date(date);
    d.setMilliseconds(0);
    return d;
}
