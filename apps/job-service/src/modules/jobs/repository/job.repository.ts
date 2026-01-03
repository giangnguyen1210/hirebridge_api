import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JobEntity } from "../entities/job.entity";
import { ILike, Repository } from "typeorm";
import { FilterJobDto } from "../dto/filter-job.dto";
import { JobStatus } from "@app/common";

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
    const where: any = {};

    if (filterJobDto.title) {
      where.title = ILike(`%${filterJobDto.title}%`);
    }

    if (filterJobDto.status) {
      where.status = filterJobDto.status as JobStatus;
    }

    if (filterJobDto.isNeedGroup !== undefined) {
      where.isNeedGroup = filterJobDto.isNeedGroup;
    }

    if (filterJobDto.createdBy) {
      where.createdBy = filterJobDto.createdBy;
    }

    if (filterJobDto.updatedBy) {
      where.updatedBy = filterJobDto.updatedBy;
    }

    console.log("where", where);
    return this.jobRepository.find({ where });
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