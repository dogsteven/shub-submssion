import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ReportService } from './app.report.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [ReportService],
})
export class AppModule {}
