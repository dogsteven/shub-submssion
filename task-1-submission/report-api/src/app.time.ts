import { BadRequestException } from "@nestjs/common";

export class Time {
    private readonly seconds: number;

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

        this.seconds = hour * 3600 + minute * 60 + second;
    }

    static compareFn(left: Time, right: Time): number {
        return Math.sign(left.seconds - right.seconds);
    }
}