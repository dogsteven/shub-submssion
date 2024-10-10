import { BadRequestException, Injectable } from "@nestjs/common";
import { Time } from "./app.time";

export type ReportEntry = {
    time: Time,
    value: number
}

export type Report = ReportEntry[];

@Injectable()
export class ReportService {
    private prepared: boolean = false;

    private accumulativeValues: number[] = [];
    private times: (Time | null)[] = [];

    prepareReport(report: Report) {
        if (report.length == 0) {
            // We should not assume that the communication channel is HTTP, but it's ok in this scenario.
            throw new BadRequestException("Report file must have at least one entry.");
        }
        
        // Sort report by time
        report.sort((left, right) => {
            return this.compareTime(left.time, right.time);
        });

        this.accumulativeValues = [0];
        this.times = [null];

        for (const entry of report) {
            if (this.compareTime(this.times[this.times.length - 1], entry.time) === 0) {
                // Handle time duplication
                this.accumulativeValues[this.accumulativeValues.length - 1] += entry.value;
            } else {
                this.times.push(entry.time);
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
        if (this.compareTime(startTime, endTime) > 0) {
            // We should not assume that the communication channel is HTTP, but it's ok in this scenario.
            throw new BadRequestException("Start time must be less than or equal to end time.");
        }

        const endIndex = this.optimizedSearchLessThanOrEqual(endTime);

        let startIndex = this.optimizedSearchLessThanOrEqual(startTime, endIndex);

        if (this.compareTime(startTime, this.times[startIndex]) == 0) {
            startIndex -= 1;
        }

        return this.accumulativeValues[endIndex] - this.accumulativeValues[startIndex];
    }

    private compareTime(left: Time | null, right: Time | null): number {
        if (!left) {
            if (!right) {
                return 0;
            }
            
            return -1;
        }

        if (!right) {
            return 1;
        }

        return Time.compareFn(left, right);
    }

    private optimizedSearchLessThanOrEqual(time: Time, upperIndex: number = this.times.length - 1): number {
        if (this.compareTime(time, this.times[upperIndex]) > 0) {
            return upperIndex;
        }

        let left = 0;
        let right = upperIndex;

        while (left < right - 1) {
            const pivot = Math.floor((left + right) / 2);

            if (this.compareTime(this.times[pivot], time) < 0) {
                left = pivot;
            } else {
                right = pivot;
            }
        }

        if (this.compareTime(time, this.times[right]) === 0) {
            return right;
        }

        return left;
    }
}