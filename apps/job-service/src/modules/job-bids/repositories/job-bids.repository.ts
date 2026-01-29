import { InjectRepository } from "@nestjs/typeorm";
import { JobBid } from "../entities/job-bid.entity";
import { Repository } from "typeorm";
import { FilterJobBidDto } from "../dto/filter-job-bid.dto";

export class JobBidRepository {
    constructor(
    @InjectRepository(JobBid)
    private jobBidRepository: Repository<JobBid>,
  ) {}

  async create(jobBid: JobBid) {
      return await this.jobBidRepository.save(jobBid);
    }

  async findOne(id: string) {
      return await this.jobBidRepository.findOne({ where: { id } });
    }

  async findAll(filterJobBidDto: FilterJobBidDto) {
    const where: any = {};

    if (filterJobBidDto.jobId) {
      where.jobId = filterJobBidDto.jobId;
    }

    if (filterJobBidDto.userId) {
      where.userId = filterJobBidDto.userId;
    }

    if (filterJobBidDto.status) {
      where.status = filterJobBidDto.status;
    }

    return await this.jobBidRepository.find({ where });
  }

  async update(id: string, jobBid: JobBid) {
    return await this.jobBidRepository.update(id, jobBid);
  }

  async delete(id: string) {
    return await this.jobBidRepository.delete(id);
  }
}