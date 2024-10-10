import { ReportService, Report } from './app.report.service';
import { Time } from './app.time';

describe("ReportService unit testing", () => {
  let reportService: ReportService;

  beforeEach(async () => {
    reportService = new ReportService();
  });

  it("should throw empty report", () => {
    const report: Report = [];

    expect(() => {
      reportService.prepareReport(report);
    }).toThrow("Report file must have at least one entry.");
  })

  it("should throw report hasn't prepared", () => {
    expect(() => {
      reportService.calculateTotalValueBetween(new Time(0, 0, 0), new Time(23, 59, 59));
    }).toThrow("Report file hasn't been prepared.");
  });

  it("should throw start time must be less than or equal to end time", () => {
    const report: Report = [
      { time: new Time(18, 37, 10), value: 20000 }
    ];

    reportService.prepareReport(report);

    expect(() => {
      reportService.calculateTotalValueBetween(new Time(0, 0, 1), new Time(0, 0, 0));
    }).toThrow("Start time must be less than or equal to end time.");
  });

  it("should return total value between", () => {
    const report: Report = [
      { time: new Time(18, 37, 10), value: 20000 },
      { time: new Time(18, 36, 37), value: 40000 },
      { time: new Time(18, 36, 4), value: 50000 },
      { time: new Time(18, 35, 35), value: 40000 },
      { time: new Time(18, 34, 52), value: 50000 },
      { time: new Time(18, 34, 34), value: 40000 },
      { time: new Time(18, 33, 36), value: 35000 },
      { time: new Time(18, 33, 32), value: 10000 },
      { time: new Time(18, 33, 32), value: 10000 },
      { time: new Time(18, 32, 33), value: 50000 },
      { time: new Time(18, 32, 25), value: 30000 },
      { time: new Time(18, 31, 38), value: 50000 },
      { time: new Time(18, 31, 32), value: 40000 },
      { time: new Time(18, 31, 7), value: 25000 },
      { time: new Time(18, 31, 7), value: 25000 },
      { time: new Time(18, 30, 23), value: 60000 },
      { time: new Time(18, 30, 23), value: 119214 },
      { time: new Time(18, 29, 11), value: 50000 }
    ];

    const queries: { startTime: Time, endTime: Time }[] = [
      { startTime: new Time(17, 0, 0), endTime: new Time(17, 30, 30) },
      { startTime: new Time(18, 29, 10), endTime: new Time(18, 29, 10) },
      { startTime: new Time(18, 29, 10), endTime: new Time(18, 29, 11) },
      { startTime: new Time(18, 29, 11), endTime: new Time(18, 29, 11) },
      { startTime: new Time(18, 29, 0), endTime: new Time(18, 32, 32) },
      { startTime: new Time(18, 30, 15), endTime: new Time(18, 30, 20) },
      { startTime: new Time(18, 31, 8), endTime: new Time(18, 33, 56) },
      { startTime: new Time(18, 32, 24), endTime: new Time(18, 36, 3) },
      { startTime: new Time(18, 37, 7), endTime: new Time(18, 39, 10) },
      { startTime: new Time(18, 37, 7), endTime: new Time(18, 37, 10) },
      { startTime: new Time(18, 37, 10), endTime: new Time(18, 37, 10) },
      { startTime: new Time(18, 37, 10), endTime: new Time(18, 37, 12) },
      { startTime: new Time(18, 37, 11), endTime: new Time(18, 37, 12) }
    ];

    function bruteForceCalculateTotalValueBetween(startTime: Time, endTime: Time): number {
      let sum = 0;

      for (const entry of report) {
        if (Time.compareFn(startTime, entry.time) <= 0 && Time.compareFn(entry.time, endTime) <= 0) {
          sum += entry.value;
        }
      }

      return sum;
    }

    reportService.prepareReport(report);

    for (const query of queries) {
      expect(reportService.calculateTotalValueBetween(query.startTime, query.endTime))
        .toBe(bruteForceCalculateTotalValueBetween(query.startTime, query.endTime));
    }
  });
});