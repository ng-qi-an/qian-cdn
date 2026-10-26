import { AppAnalytics } from "@/lib/schema/schemaTypes";
import { TZDate } from "@date-fns/tz";

const chartData = [
  { date: "2024-04-01", project1: 30, project2: 20 },
  { date: "2024-04-02", project1: 97, project2: 180 },
  { date: "2024-04-03", project1: 167, project2: 120 },
  { date: "2024-04-04", project1: 242, project2: 260 },
  { date: "2024-04-05", project1: 373, project2: 290 },
  { date: "2024-04-06", project1: 301, project2: 340 },
  { date: "2024-04-07", project1: 245, project2: 180 },
  { date: "2024-04-08", project1: 409, project2: 320 },
  { date: "2024-04-09", project1: 59, project2: 110 },
  { date: "2024-04-10", project1: 261, project2: 190 },
  { date: "2024-04-11", project1: 327, project2: 350 },
  { date: "2024-04-12", project1: 292, project2: 210 },
  { date: "2024-04-13", project1: 342, project2: 380 },
  { date: "2024-04-14", project1: 137, project2: 220 },
  { date: "2024-04-15", project1: 120, project2: 170 },
  { date: "2024-04-16", project1: 138, project2: 190 },
  { date: "2024-04-17", project1: 446, project2: 360 },
  { date: "2024-04-18", project1: 364, project2: 410 },
  { date: "2024-04-19", project1: 243, project2: 180 },
  { date: "2024-04-20", project1: 89, project2: 150 },
  { date: "2024-04-21", project1: 137, project2: 200 },
  { date: "2024-04-22", project1: 224, project2: 170 },
  { date: "2024-04-23", project1: 138, project2: 230 },
  { date: "2024-04-24", project1: 387, project2: 290 },
  { date: "2024-04-25", project1: 215, project2: 250 },
  { date: "2024-04-26", project1: 75, project2: 130 },
  { date: "2024-04-27", project1: 383, project2: 420 },
  { date: "2024-04-28", project1: 122, project2: 180 },
  { date: "2024-04-29", project1: 315, project2: 240 },
  { date: "2024-04-30", project1: 454, project2: 380 },
]

const formatDate = (date: Date, timezone: string) => {
    const localDate = new TZDate(date.getTime(), timezone);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export default function getGroupedAnalyticsChartData({data, timezone, startDate, endDate}: {data: AppAnalytics[], timezone: string, startDate: Date, endDate: Date}){
    const dates: string[] = [];  
    const start = new TZDate(startDate.getTime(), timezone);
    const end = new TZDate(endDate.getTime(), timezone);
      for (let day = new TZDate(start.getFullYear(), start.getMonth(), start.getDate(), timezone); day.getTime() < end.getTime(); day = new TZDate(day.getFullYear(), day.getMonth(), day.getDate() + 1, timezone)) {
        dates.push(formatDate(day, timezone));
    }

    const recordsByApp = new Map<string, AppAnalytics[]>();
    for (const record of data) {
        const records = recordsByApp.get(record.applicationId) ?? [];
        records.push(record);
        recordsByApp.set(record.applicationId, records);
    }

    for (const records of recordsByApp.values()) {
        records.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    }

    return dates.map((date) => {
        const entry: { date: string } & Record<string, any> = { date };

        for (const [appId, records] of recordsByApp) {
        const dateRecords = records.filter(
            (record) => formatDate(record.startDate, timezone) === date,
        );

        if (dateRecords.length > 0) {
            // Use the recorded value for dates with events.
            entry[appId] = Number(dateRecords[dateRecords.length - 1].value);
            continue;
        }

        // Find the next event after this date.
        const nextRecord = records.find(
            (record) => formatDate(record.startDate, timezone) > date,
        );

        if (nextRecord) {
            // Fill the gap using the baseline before the next event.
            entry[appId] = Number(nextRecord.prevValue);
            continue;
        }

        // No future event: carry forward the latest recorded value.
        const previousRecords = records.filter(
            (record) => formatDate(record.startDate, timezone) < date,
        );
        const previousRecord = previousRecords[previousRecords.length - 1];

        if (previousRecord) {
            entry[appId] = Number(previousRecord.value);
        }
        }

        return entry;
    });
}