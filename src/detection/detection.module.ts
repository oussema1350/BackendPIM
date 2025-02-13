import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DetectionService } from './detection.service';
import { DetectionController } from './detection.controller';

@Module({
  imports: [HttpModule],
  controllers: [DetectionController],
  providers: [DetectionService],
})
export class DetectionModule {}