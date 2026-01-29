import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobContractDto } from './dto/create-job-contract.dto';
import { UpdateJobContractDto } from './dto/update-job-contract.dto';
import { JobContract } from './entities/job-contract.entity';
import { JobContractStatus } from '@app/common';
import { JobContractRepository } from './repositories/job-contract.repository';
import { FilterJobContractDto } from './dto/filter-job-contract.dto';

@Injectable()
export class JobContractsService {
  constructor(
    private readonly jobContractRepository: JobContractRepository,
  ) { }

  async create(createJobContractDto: CreateJobContractDto) {
    const jobContract = Object.assign(new JobContract(), createJobContractDto);
    jobContract.representativeAId = createJobContractDto['createdBy'];
    jobContract.representativeBId = createJobContractDto['representativeBId'];
    jobContract.status = JobContractStatus.CREATED;
    await this.jobContractRepository.create(jobContract);

    return jobContract;
  }

  async findAll(filter: FilterJobContractDto) {
    return await this.jobContractRepository.findAll(filter);
  }

  async findOne(id: string) {
    const jobContract = await this.jobContractRepository.findOne(id);

    if (!jobContract) {
      throw new NotFoundException(`Job contract with id ${id} not found`);
    }

    return jobContract;
  }

  async update(id: string, updateJobContractDto: UpdateJobContractDto) {
    const jobContract = await this.findOne(id);

    Object.assign(jobContract, updateJobContractDto);
    return await this.jobContractRepository.update(id, jobContract);
  }

  remove(id: string) {
    return this.jobContractRepository.delete(id);
  }
}
