import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobBidDto } from './dto/create-job-bid.dto';
import { UpdateJobBidDto } from './dto/update-job-bid.dto';
import { JobBidRepository } from './repositories/job-bids.repository';
import { JobBid } from './entities/job-bid.entity';
import { JobBidStatus } from '@app/common';
import { FilterJobBidDto } from './dto/filter-job-bid.dto';

@Injectable()
export class JobBidsService {
  constructor(
    private readonly jobBidRepository: JobBidRepository,
  ) { }

  async create(jobBidDto: CreateJobBidDto) {
    const jobBid = Object.assign(new JobBid(), jobBidDto);
    jobBid.userId = jobBidDto['createdBy'];
    jobBid.status = JobBidStatus.PENDING;
    await this.jobBidRepository.create(jobBid);

    return jobBid;
  }

  async findAll(filterJobBidDto: FilterJobBidDto) {
    return await this.jobBidRepository.findAll(filterJobBidDto);
  }

  async findOne(id: string) {
    return await this.jobBidRepository.findOne(id);
  }

  async update(id: string, updateBidDto: UpdateJobBidDto) {
    const updatedJobBid = await this.findOne(id);
    if (!updatedJobBid) {
      throw new NotFoundException(`JobBid with id ${id} not found`);
    }
    Object.assign(updatedJobBid, updateBidDto);
    return this.jobBidRepository.update(id, updatedJobBid);
  }

  async remove(id: string) {
    const jobBid = await this.findOne(id);
    if (!jobBid) {
      throw new NotFoundException(`JobBid with id ${id} not found`);
    }
    return this.jobBidRepository.delete(id);
  }
}
