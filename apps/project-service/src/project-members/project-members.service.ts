import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { ProjectMemberRepository } from './repositories/project-member.repository';
import { ProjectMember } from './entities/project-member.entity';
import { FilterProjectMemberDto } from './dto/filter-project-member.dto';

@Injectable()
export class ProjectMembersService {
  constructor(
    private readonly projectMemberRepository: ProjectMemberRepository,
  ) {}

  async create(createProjectMemberDto: CreateProjectMemberDto) {
    const projectMember = Object.assign(new ProjectMember(), createProjectMemberDto);
    return await this.projectMemberRepository.create(projectMember);
  }

  async findAll(filter: FilterProjectMemberDto) {
    return await this.projectMemberRepository.findAll(filter);
  }

  async findOne(id: string) {
    const projectMember = await this.projectMemberRepository.findOne(id);
    if (!projectMember) {
      throw new NotFoundException('Project member not found');
    }
    return projectMember;
  }

  async update(id: string, updateProjectMemberDto: UpdateProjectMemberDto) {
    const projectMember = await this.findOne(id);
    Object.assign(projectMember, updateProjectMemberDto);
    return await this.projectMemberRepository.update(id, projectMember);
  }

  async remove(id: string) {
    const projectMember = await this.findOne(id);
    return await this.projectMemberRepository.delete(projectMember.id);
  }
}
