import { BadRequestException, Injectable } from "@nestjs/common";

export type Time = {
    hour: number
    minute: number
    second: number
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
            const leftTimeSeconds = this.convertTimeToSeconds(left.time);
            const rightTimeSeconds = this.convertTimeToSeconds(right.time);

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
            const seconds = this.convertTimeToSeconds(entry.time);

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

        const startTimeSeconds = this.convertTimeToSeconds(startTime);
        const endTimeSeconds = this.convertTimeToSeconds(endTime);

        if (startTimeSeconds > endTimeSeconds) {
            // We should not assume that the communication channel is HTTP, but it's ok in this scenario.
            throw new BadRequestException("Start time must be less than or equal to end time.");
        }

        let startIndex = this.searchLessThanOrEqual(startTimeSeconds);

        if (startTimeSeconds == this.times[startIndex]) {
            startIndex -= 1;
        }

        const endIndex = this.searchLessThanOrEqual(endTimeSeconds);

        return this.accumulativeValues[endIndex] - this.accumulativeValues[startIndex];
    }

    private searchLessThanOrEqual(seconds: number): number {
        if (seconds > this.times[this.times.length - 1]) {
            return this.times.length - 1;
        }

        let left = 0;
        let right = this.times.length - 1;

        // Binary search with invariance: this.times[left] < seconds <= this.times[right]
        while (left < right) {
            // Check if still can divide
            if (left == right - 1) {
                break;
            }

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

    private convertTimeToSeconds(time: Time): number {
        let { hour, minute, second } = time;

        return hour * 3600 + minute * 60 + second;
    }
}