import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMembersService } from './project-members.service';
import { ProjectMembersController } from './project-members.controller';
import { ProjectMemberRepository } from './repositories/project-member.repository';
import { ProjectMember } from './entities/project-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectMember])
  ],
  controllers: [ProjectMembersController],
  providers: [ProjectMembersService, ProjectMemberRepository],
  exports: [ProjectMemberRepository],
})
export class ProjectMembersModule {}
