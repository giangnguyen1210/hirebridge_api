import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobContractsService } from './job-contracts.service';
import { JobContractsController } from './job-contracts.controller';
import { JobContract } from './entities/job-contract.entity';
import { JobContractRepository } from './repositories/job-contract.repository';

@Module({
  imports: [TypeOrmModule.forFeature([JobContract])],
  controllers: [JobContractsController],
  providers: [JobContractsService, JobContractRepository],
})
export class JobContractsModule {}
