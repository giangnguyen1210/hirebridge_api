import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectMember } from '../project-members/entities/project-member.entity';
import { UnitOfWork } from '../common/database/unit-of-work';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectMembersModule } from '../project-members/project-members.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectMember  // Cần import ProjectMember để UnitOfWork có thể save
    ]),
    ProjectMembersModule  // Import module để có thể dùng repository nếu cần
  ],
  controllers: [ProjectsController],
  providers: [
    ProjectsService, 
    UnitOfWork,
    ProjectRepository
  ],
})
export class ProjectsModule {}
