import { Module } from '@nestjs/common';
import { JobContractsService } from './job-contracts.service';
import { JobContractsController } from './job-contracts.controller';

@Module({
  controllers: [JobContractsController],
  providers: [JobContractsService],
})
export class JobContractsModule {}
