import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JobEntity } from "../entities/job.entity";
import { ILike, Repository } from "typeorm";
import { FilterJobDto } from "../dto/filter-job.dto";
import { JobStatus, JobType } from "@app/common";

@Injectable()
export class JobRepository {
  constructor(
    @InjectRepository(JobEntity)
    private readonly jobRepository: Repository<JobEntity>,
  ) {}

  async create(job: JobEntity) {
    return this.jobRepository.save(job);
  }

  async findAll(filterJobDto: FilterJobDto) {
    // Build base conditions for non-search filters
    const baseConditions: any = {};

    if (filterJobDto.status) {
      baseConditions.status = filterJobDto.status as JobStatus;
    }

    if (filterJobDto.isNeedGroup !== undefined) {
      baseConditions.isNeedGroup = filterJobDto.isNeedGroup;
    }

    if (filterJobDto.createdBy) {
      baseConditions.createdBy = filterJobDto.createdBy;
    }

    if (filterJobDto.updatedBy) {
      baseConditions.updatedBy = filterJobDto.updatedBy;
    }

    if (filterJobDto.jobType) {
      baseConditions.jobType = filterJobDto.jobType as JobType;
    }

    // Build where conditions - use array for OR conditions when searching
    let where: any;

    if (filterJobDto.search) {
      // Create OR conditions for search across multiple fields
      where = [
        { title: ILike(`%${filterJobDto.search}%`), ...baseConditions },
        { description: ILike(`%${filterJobDto.search}%`), ...baseConditions },
        { location: ILike(`%${filterJobDto.search}%`), ...baseConditions },
        { jobType: ILike(`%${filterJobDto.search}%`), ...baseConditions },
      ];
    } else {
      where = baseConditions;
    }

    const [result, total] = await this.jobRepository.findAndCount({
      where,
      skip: filterJobDto.calculatedSkip,
      take: filterJobDto.limit,
      order: {
        createdAt: 'DESC', // Default sorting by newest first
      },
    });

    return { result, total };
  }

  async findOne(id: string) {
    return this.jobRepository.findOne({ where: { id } });
  }

  async update(id: string, job: JobEntity) {
    return this.jobRepository.update(id, job);
  }

  async delete(id: string) {
    return this.jobRepository.delete(id);
  }
}