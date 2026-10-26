import { TZDate } from "@date-fns/tz";

export function formatLocalDateTime(date: Date) {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getDateRange(day: string | Date, days: number, timezone: string) {
    const localDay = typeof day === "string" ? day.split("-").map(Number) : (() => {
        const d = new TZDate(day.getTime(), timezone);
        return [
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
        ];
    })();

    const [year, month, date] = localDay;
    const start = new TZDate(year, month - 1, date, timezone);
    const end = new TZDate(year, month - 1, date + days, timezone);

    return {
        start: new Date(start.getTime()),
        end: new Date(end.getTime()),
    };
}