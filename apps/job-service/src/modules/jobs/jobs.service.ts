import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobEntity } from './entities/job.entity';
import { JobRepository } from './repository/job.repository';
import { JobStatus } from '@app/common';
import { FilterJobDto } from './dto/filter-job.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobRepository: JobRepository,
  ) {}
  async create(createJobDto: CreateJobDto) {
    console.log('💾 [JobsService] Creating job with data:', createJobDto);
    console.log('✨ [JobsService] createdBy field:', createJobDto['createdBy'] || 'MISSING!');
    // TODO: Implement actual database insertion
  
    const job = Object.assign(new JobEntity(), createJobDto);
    job.createdBy = createJobDto['createdBy'];
    job.status = JobStatus.OPEN;
    console.log('💾 [JobsService] Created job:', job);
    await this.jobRepository.create(job);
    
    return job;
  }

  async findAll(filterJobDto: FilterJobDto) {
    return await this.jobRepository.findAll(filterJobDto);
  }

  async findOne(id: string) {
    return await this.jobRepository.findOne(id);
  }

  async update(id: string, job: UpdateJobDto) {
    const updatedJob = await this.findOne(id);
    if (!updatedJob) {
      throw new Error(`Job with id ${id} not found`);
    }
    Object.assign(updatedJob, job);
    updatedJob.updatedBy = job['updatedBy'];
    return this.jobRepository.update(id, updatedJob);
  }

  async remove(id: string) {
    return this.jobRepository.delete(id);
  }
}
