import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobEntity } from './entities/job.entity';
import { JobRepository } from './repository/job.repository';
import { JobStatus, PageMetaDto } from '@app/common';
import { FilterJobDto } from './dto/filter-job.dto';
import { UserClientService } from '../user-client/user-client.service';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly userClientService: UserClientService,
  ) {}

  async create(createJobDto: CreateJobDto) {
    const job = new JobEntity();
    Object.assign(job, createJobDto);
    await this.jobRepository.create(job);
    return job;
  }

  async findAll(filterJobDto: FilterJobDto, includeUser = false) {
    const { result, total } = await this.jobRepository.findAll(filterJobDto);
    const meta = new PageMetaDto(filterJobDto, total);

    // If includeUser is requested, fetch user details for all jobs
    if (includeUser && result.length > 0) {
      const userIds = result
        .map((job) => job.createdBy)
        .filter((userId) => userId);

      const usersMap = await this.userClientService.getUsersByIds(userIds);

      // Attach user details to each job
      const dataWithUsers = result.map((job) => ({
        ...job,
        user: job.createdBy ? usersMap.get(job.createdBy) : null,
      }));

      return {
        data: dataWithUsers,
        meta,
      };
    }

    return {
      data: result,
      meta,
    };
  }

  async findOne(id: string, includeUser = false) {
    const job = await this.jobRepository.findOne(id);

    if (!job) {
      return null;
    }

    // If includeUser is requested and job has createdBy, fetch user details
    if (includeUser && job.createdBy) {
      const user = await this.userClientService.getUserById(job.createdBy);
      return {
        ...job,
        user: user,
      };
    }

    return job;
  }

  async update(id: string, job: UpdateJobDto) {
    const updatedJob = await this.findOne(id);
    if (!updatedJob) {
      throw new Error(`Job with id ${id} not found`);
    }
    Object.assign(updatedJob, job);
    return this.jobRepository.update(id, updatedJob);
  }

  async remove(id: string) {
    return this.jobRepository.delete(id);
  }
}
