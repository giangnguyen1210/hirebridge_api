import { InjectRepository } from "@nestjs/typeorm";
import { JobBid } from "../entities/job-bid.entity";
import { Repository } from "typeorm";

export class JobBidRepository {
    constructor(
    @InjectRepository(JobBid)
    private jobBidRepository: Repository<JobBid>,
  ) {}

    async createJobBid(jobBid: JobBid) {
      return await this.jobBidRepository.save(jobBid);
    }

    async findJobBidById(id: string) {
      return await this.jobBidRepository.findOne({ where: { id } });
    }

    async findJobBidByJobId(jobId: string) {
      return await this.jobBidRepository.find({ where: { jobId } });
    }

    async findJobBidByUserId(userId: string) {
      return await this.jobBidRepository.find({ where: { userId } });
    }

    async findJobBidByJobIdAndUserId(jobId: string, userId: string) {
      return await this.jobBidRepository.findOne({ where: { jobId, userId } });
    }

    async updateJobBid(id: string, jobBid: JobBid) {
      return await this.jobBidRepository.update(id, jobBid);
    }

    async deleteJobBid(id: string) {
      return await this.jobBidRepository.delete(id);
    }
}