import { ArgumentMetadata, BadRequestException, Controller, FileTypeValidator, Get, Injectable, ParseFilePipe, PipeTransform, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReportService } from './app.report.service';
import * as XLSX from "xlsx";
import { Report, Time } from './app.report.service';

type PrepareReportResponse = {
  message: string
};

type CalculateTotalValueBetweenResponse = {
  result: number
};

@Injectable()
export class TimeTransform implements PipeTransform {
  private regex = /^(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})$/;

  transform(value: string | undefined, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException(`Value for query key "${metadata.data}" is missing.`);
    }

    const regexResult = this.regex.exec(value);

    if (!regexResult) {
      throw new BadRequestException(`Invalid time format for query key "${metadata.data}" (expected format is "hh:mm:ss").`);
    }

    const groups = regexResult.groups;

    let hour = Number.parseInt(groups.hour);
    let minute = Number.parseInt(groups.minute);
    let second = Number.parseFloat(groups.second);

    // This check should belong to the Time class, but it's ok in this scenario.
    if (hour >= 24) {
      throw new BadRequestException(`Invalid hour value for query key "${metadata.data}" (hour value must be between 0 and 23).`);
    }

    // This check should belong to the Time class, but it's ok in this scenario.
    if (minute >= 60) {
      throw new BadRequestException(`Invalid minute value for query key "${metadata.data}" (minute value must be between 0 and 59).`);
    }

    // This check should belong to the Time class itself, but it's ok in this scenario.
    if (second >= 60) {
      throw new BadRequestException(`Invalid second value for query key "${metadata.data}" (second value must be between 0 and 59).`);
    }

    return { hour, minute, second }
  }

}

@Controller()
export class AppController {
  constructor(private readonly reportService: ReportService) {}

  private genereateReport(buffer: Buffer): Report {
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: true, raw: true });

    const report: Report = rows.slice(8).map((row) => {
      const timeString: string = row[2];

      const time: Time = {
        hour: Number.parseInt(timeString.substring(0, 2)),
        minute: Number.parseInt(timeString.substring(3, 5)),
        second: Number.parseInt(timeString.substring(6, 8))
      };

      const value: number = row[8];

      return { time, value };
    });

    return report;
  }

  @Post("prepareReport")
  @UseInterceptors(FileInterceptor("file"))
  prepareReport(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
        ]
      })
    ) file: Express.Multer.File
  ): PrepareReportResponse {
    const report = this.genereateReport(file.buffer);

    this.reportService.prepareReport(report);

    return { message: "Prepared" };
  }

  @Get("calculateTotalValueBetween")
  calculateTotalValueBetween(
    @Query("start_time", TimeTransform) startTime: Time,
    @Query("end_time", TimeTransform) endTime: Time
  ): CalculateTotalValueBetweenResponse {
    return {
      result: this.reportService.calculateTotalValueBetween(startTime, endTime)
    };
  }
}
