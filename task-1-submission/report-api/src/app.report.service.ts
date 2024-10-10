import { BadRequestException, Injectable } from "@nestjs/common";

export class Time {
    private readonly hour: number;
    private readonly minute: number;
    private readonly second: number;

    constructor(hour: number, minute: number, second: number) {
        if (hour < 0 || hour >= 24) {
            // We should not assume that the communication channel is HTTP, but it's ok in this scenario.
            throw new BadRequestException(`Invalid hour value ${hour} (hour value must be between 0 and 23).`);
        }

        if (minute < 0 || minute >= 60) {
            // We should not assume that the communication channel is HTTP, but it's ok in this scenario.
            throw new BadRequestException(`Invalid minute value ${minute} (minute value must be between 0 and 59).`);
        }

        if (second < 0 || second >= 60) {
            // We should not assume that the communication channel is HTTP, but it's ok in this scenario.
            throw new BadRequestException(`Invalid second value ${second} (second value must be between 0 and 59).`);
        }

        this.hour = hour;
        this.minute = minute;
        this.second = second;
    }

    convertToSeconds(): number {
        return this.hour * 3600 + this.minute * 60 + this.second;
    }
}

export type ReportEntry = {
    time: Time,
    value: number
}

export type Report = ReportEntry[];

@Injectable()
export class ReportService {
    private prepared: boolean = false;

    private accumulativeValues: number[] = [];
    private times: number[] = [];

    prepareReport(report: Report) {
        if (report.length == 0) {
            // We should not assume that the communication channel is HTTP, but it's ok in this scenario.
            throw new BadRequestException("Report file must have at least one entry.");
        }
        
        // Sort report by time
        report.sort((left, right) => {
            const leftTimeSeconds = left.time.convertToSeconds();
            const rightTimeSeconds = right.time.convertToSeconds();

            if (leftTimeSeconds < rightTimeSeconds) {
                return -1;
            } else if (leftTimeSeconds == rightTimeSeconds) {
                return 0;
            } else {
                return 1;
            }
        });

        this.accumulativeValues = [0];
        this.times = [-1];

        for (const entry of report) {
            const seconds = entry.time.convertToSeconds();

            if (this.times[this.times.length - 1] == seconds) {
                // Handle time duplication
                this.accumulativeValues[this.accumulativeValues.length - 1] += entry.value;
            } else {
                this.times.push(seconds);
                this.accumulativeValues.push(this.accumulativeValues[this.accumulativeValues.length - 1] + entry.value);
            }
        }

        this.prepared = true;
    }

    calculateTotalValueBetween(startTime: Time, endTime: Time): number {
        if (!this.prepared) {
            // We should not assume that the communication channel is HTTP, but it's ok in this scenario.
            throw new BadRequestException("Report file hasn't been prepared.");
        }

        const startTimeSeconds = startTime.convertToSeconds();
        const endTimeSeconds = endTime.convertToSeconds();

        if (startTimeSeconds > endTimeSeconds) {
            // We should not assume that the communication channel is HTTP, but it's ok in this scenario.
            throw new BadRequestException("Start time must be less than or equal to end time.");
        }

        const endIndex = this.optimizedSearchLessThanOrEqual(endTimeSeconds);

        let startIndex = this.optimizedSearchLessThanOrEqual(startTimeSeconds, endIndex);

        if (startTimeSeconds == this.times[startIndex]) {
            startIndex -= 1;
        }

        return this.accumulativeValues[endIndex] - this.accumulativeValues[startIndex];
    }

    private optimizedSearchLessThanOrEqual(seconds: number, upperIndex: number = this.times.length - 1): number {
        if (seconds > this.times[upperIndex]) {
            return upperIndex;
        }

        let left = 0;
        let right = upperIndex;

        while (left < right - 1) {
            const pivot = Math.floor((left + right) / 2);

            if (this.times[pivot] < seconds) {
                left = pivot;
            } else {
                right = pivot;
            }
        }

        if (seconds == this.times[right]) {
            return right;
        }

        return left;
    }
}