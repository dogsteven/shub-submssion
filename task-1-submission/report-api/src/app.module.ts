import { Module } from '@nestjs/common';
import { AppController, TimeTransform } from './app.controller';
import { ReportService } from './app.report.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [ReportService, TimeTransform],
})
export class AppModule {}
