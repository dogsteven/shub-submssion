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
  private regex = /(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})/;

  transform(value: string, metadata: ArgumentMetadata) {
    const regexResult = this.regex.exec(value);

    if (!regexResult) {
      throw new BadRequestException(`Invalid time format "${value}".`);
    }

    const groups = regexResult.groups;

    let hour = Number.parseInt(groups.hour);
    let minute = Number.parseInt(groups.minute);
    let second = Number.parseFloat(groups.second);

    if (hour >= 24) {
      throw new BadRequestException(`Invalid hour value ${hour} in "${value}"`);
    }

    if (minute >= 60) {
      throw new BadRequestException(`Invalid minute value ${minute} in "${value}"`);
    }

    if (second >= 60) {
      throw new BadRequestException(`Invalid second value ${second} in "${value}"`);
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
    if (!file) {
      throw new BadRequestException("Report file is missing.");
    }

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
