import { Module } from '@nestjs/common';
import { JobServiceController } from './job-service.controller';
import { JobServiceService } from './job-service.service';

@Module({
  imports: [],
  controllers: [JobServiceController],
  providers: [JobServiceService],
})
export class JobServiceModule {}
