import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { ProjectRepository } from './repositories/project.repository';
import { FilterProjectDto } from './dto/filter-project.dto';
import { UnitOfWork } from '../common/database/unit-of-work';
import { ProjectMember } from '../project-members/entities/project-member.entity';
import { ProjectMemberRole } from '@app/common';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    return await this.unitOfWork.execute(async () => {
      const manager = this.unitOfWork.getManager();

      // Tạo project
      const project = Object.assign(new Project(), createProjectDto);
      const savedProject = await manager.save(Project, project);

      // Tạo project member với role LEADER
      const projectMember = new ProjectMember();
      projectMember.projectId = savedProject.id;
      projectMember.userId = createProjectDto['createdBy'];
      projectMember.role = ProjectMemberRole.LEADER;
      await manager.save(ProjectMember, projectMember);

      return savedProject;
    });
  }

  findAll(filter: FilterProjectDto) {
    return this.projectRepository.findAll(filter);
  }

  findOne(id: string) {
    return this.projectRepository.findOne(id);
  }

  update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = Object.assign(new Project(), updateProjectDto);
    
    if (!project) {
      throw new Error(`Project with id ${id} not found`);
    }
    this.projectRepository.update(id, project)
    return project;
  }

  remove(id: string) {
    return this.projectRepository.delete(id);
  }
}
