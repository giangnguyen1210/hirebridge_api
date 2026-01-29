import { InjectRepository } from "@nestjs/typeorm";
import { JobContract } from "../entities/job-contract.entity";
import { Repository } from "typeorm";
import { FilterJobContractDto } from "../dto/filter-job-contract.dto";

export class JobContractRepository {
  constructor(
    @InjectRepository(JobContract)
    private jobContractRepository: Repository<JobContract>,
  ) {} 

  async create(jobContract: JobContract) {
    return await this.jobContractRepository.save(jobContract);
  }

  async findOne(id: string) {
    return await this.jobContractRepository.findOne({ where: { id } });
  }

  async findAll(filter: FilterJobContractDto) {
    const where: any = {};
    if (filter.jobId) {
      where.jobId = filter.jobId;
    }
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.representativeAId) {
      where.representativeAId = filter.representativeAId;
    }
    if (filter.representativeBId) {
      where.representativeBId = filter.representativeBId;
    }
    return await this.jobContractRepository.find({ where });
  }

  async update(id: string, jobContract: JobContract) {
    return await this.jobContractRepository.update(id, jobContract);
  }

  async delete(id: string) {
    return await this.jobContractRepository.delete(id);
  }
}