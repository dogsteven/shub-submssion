import { Time } from "./app.time";

describe("ReportService unit testing", () => {  
  it("should return number of seconds", () => {
    const hour = 6;
    const minute = 45;
    const second = 56;

    const time = new Time(hour, minute, second);

    expect(time.convertToSeconds()).toBe(hour * 3600 + minute * 60 + second);
  });

  it("should throw invalid hour value 1", () => {
    const hour = -2;
    const minute = 45;
    const second = 56;

    expect(() => {
      new Time(hour, minute, second);
    }).toThrow(`Invalid hour value ${hour} (hour value must be between 0 and 23).`);
  });

  it("should throw invalid hour value 2", () => {
    const hour = 32;
    const minute = 45;
    const second = 56;

    expect(() => {
      new Time(hour, minute, second);
    }).toThrow(`Invalid hour value ${hour} (hour value must be between 0 and 23).`);
  });

  it("should throw invalid hour value 3", () => {
    const hour = -1;
    const minute = 45;
    const second = 56;

    expect(() => {
      new Time(hour, minute, second);
    }).toThrow(`Invalid hour value ${hour} (hour value must be between 0 and 23).`);
  });

  it("should throw invalid hour value 4", () => {
    const hour = 24;
    const minute = 45;
    const second = 56;

    expect(() => {
      new Time(hour, minute, second);
    }).toThrow(`Invalid hour value ${hour} (hour value must be between 0 and 23).`);
  });

  it("should throw invalid minute value 1", () => {
    const hour = 6;
    const minute = -5;
    const second = 56;

    expect(() => {
      new Time(hour, minute, second);
    }).toThrow(`Invalid minute value ${minute} (minute value must be between 0 and 59).`);
  });

  it("should throw invalid minute value 2", () => {
    const hour = 6;
    const minute = 89;
    const second = 56;

    expect(() => {
      new Time(hour, minute, second);
    }).toThrow(`Invalid minute value ${minute} (minute value must be between 0 and 59).`);
  });

  it("should throw invalid minute value 3", () => {
    const hour = 6;
    const minute = -1;
    const second = 56;

    expect(() => {
      new Time(hour, minute, second);
    }).toThrow(`Invalid minute value ${minute} (minute value must be between 0 and 59).`);
  });

  it("should throw invalid minute value 4", () => {
    const hour = 6;
    const minute = 60;
    const second = 56;

    expect(() => {
      new Time(hour, minute, second);
    }).toThrow(`Invalid minute value ${minute} (minute value must be between 0 and 59).`);
  });

  it("should throw invalid second value 1", () => {
    const hour = 6;
    const minute = 45;
    const second = -65;

    expect(() => {
      new Time(hour, minute, second);
    }).toThrow(`Invalid second value ${second} (second value must be between 0 and 59).`);
  });

  it("should throw invalid second value 2", () => {
    const hour = 6;
    const minute = 45;
    const second = 90;

    expect(() => {
      new Time(hour, minute, second);
    }).toThrow(`Invalid second value ${second} (second value must be between 0 and 59).`);
  });

  it("should throw invalid second value 3", () => {
    const hour = 6;
    const minute = 45;
    const second = -1;

    expect(() => {
      new Time(hour, minute, second);
    }).toThrow(`Invalid second value ${second} (second value must be between 0 and 59).`);
  });

  it("should throw invalid second value 4", () => {
    const hour = 6;
    const minute = 45;
    const second = -60;

    expect(() => {
      new Time(hour, minute, second);
    }).toThrow(`Invalid second value ${second} (second value must be between 0 and 59).`);
  });
});