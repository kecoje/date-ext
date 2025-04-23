import { config } from "./DateExt";

type Timezone = {
    value: string;
    abbr: string;
    offset: number; // hours
    isdst: boolean;
    text: string;
    utc: string[];
};

function getDSTStartEndByYear(year: number): { start: Date; end: Date } {
    function getLastSunday(month: number): Date {
        // Create a date object on the first day of the next month, then step back
        const date = new Date(Date.UTC(year, month + 1, 0)); // last day of the month
        const dayOfWeek = date.getUTCDay(); // 0 = Sunday
        const lastSunday = new Date(date);
        lastSunday.setUTCDate(date.getUTCDate() - dayOfWeek);
        return lastSunday;
    }

    const dstStart = getLastSunday(2); // March is month 2 in 0-based index
    dstStart.setUTCHours(1, 0, 0, 0); // 01:00 UTC

    const dstEnd = getLastSunday(9); // October is month 9
    dstEnd.setUTCHours(1, 0, 0, 0); // 01:00 UTC

    return { start: dstStart, end: dstEnd };
}

function isDST(date: Date): boolean {
    const year = date.getFullYear();

    const { start, end } = getDSTStartEndByYear(year);

    return date >= start && date <= end;
}

function offsetFromTz(tz?: Timezone, d?: Date): number {
    if (!tz) return 0;
    d ??= new Date();
    if (tz.isdst && !isDST(d)) {
        return tz.offset - 1;
    } else {
        return tz.offset;
    }
}

export default Timezone;
export { offsetFromTz, isDST };
