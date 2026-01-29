import { InjectRepository } from "@nestjs/typeorm";
import { Project } from "../entities/project.entity";
import { Repository } from "typeorm";
import { FilterProjectDto } from "../dto/filter-project.dto";

export class ProjectRepository {
    constructor(
      @InjectRepository(Project)
      private projectRepository: Repository<Project>,
    ) {}

    async create(project: Project) {
      return await this.projectRepository.save(project);
    }

    async findOne(id: string) {
      return await this.projectRepository.findOne({ where: { id } });
    }

    async findAll(filter: FilterProjectDto) {
      const where: any = {};
      if (filter.jobId) {
        where.jobId = filter.jobId;
      }
      if (filter.createdBy) {
        where.createdBy = filter.createdBy;
      }
      return await this.projectRepository.find({ where });
    }

    async update(id: string, project: Project) {
      return await this.projectRepository.update(id, project);
    }

    async delete(id: string) {
      return await this.projectRepository.delete(id);
    }
} 