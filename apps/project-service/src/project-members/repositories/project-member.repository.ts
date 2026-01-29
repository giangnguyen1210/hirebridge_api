import { InjectRepository } from "@nestjs/typeorm";
import { ProjectMember } from "../entities/project-member.entity";
import { Repository } from "typeorm";
import { FilterProjectMemberDto } from "../dto/filter-project-member.dto";

export class ProjectMemberRepository {
  constructor(
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
  ) {}

  create(projectMember: ProjectMember) {
    return this.projectMemberRepository.save(projectMember);
  }

  findOne(id: string) {
    return this.projectMemberRepository.findOne({ where: { id } });
  }

  findAll(filter: FilterProjectMemberDto) {
    const where: any = {};
    if (filter.projectId) {
      where.projectId = filter.projectId;
    }
    if (filter.userId) {
      where.userId = filter.userId;
    }
    if (filter.role) {
      where.role = filter.role;
    }
    return this.projectMemberRepository.find({ where });
  }

  update(id: string, projectMember: ProjectMember) {
    return this.projectMemberRepository.update(id, projectMember);
  }

  delete(id: string) {
    return this.projectMemberRepository.delete(id);
  }
}