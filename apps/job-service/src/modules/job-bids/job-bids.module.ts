import { Module } from '@nestjs/common';
import { JobBidsService } from './job-bids.service';
import { JobBidsController } from './job-bids.controller';

@Module({
  controllers: [JobBidsController],
  providers: [JobBidsService],
})
export class JobBidsModule {}
