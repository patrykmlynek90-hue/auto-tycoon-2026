
export const TICKS_PER_DAY = 3;
export const HOURS_PER_TICK = 8;

export function advanceDate(currentDate: Date, ticks: number = 1): Date {
    const newDate = new Date(currentDate);
    newDate.setTime(newDate.getTime() + (ticks * HOURS_PER_TICK * 60 * 60 * 1000));
    return newDate;
}

export function isNewMonth(oldDate: Date, newDate: Date): boolean {
    return oldDate.getMonth() !== newDate.getMonth();
}

export function getEra(year: number): string {
    if (year < 1960) return 'Era Pionierów';
    if (year < 1973) return 'Era Muscle Cars';
    if (year < 1985) return 'Era Kryzysu Paliwowego';
    if (year < 1995) return 'Era Elektroniki';
    if (year < 2010) return 'Era Globalizacji';
    return 'Era Elektryfikacji';
}
