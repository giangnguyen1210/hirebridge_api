import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobBidsService } from './job-bids.service';
import { JobBidsController } from './job-bids.controller';
import { JobBid } from './entities/job-bid.entity';
import { JobBidRepository } from './repositories/job-bids.repository';

@Module({
  imports: [TypeOrmModule.forFeature([JobBid])],
  controllers: [JobBidsController],
  providers: [JobBidsService, JobBidRepository],
})
export class JobBidsModule {}
