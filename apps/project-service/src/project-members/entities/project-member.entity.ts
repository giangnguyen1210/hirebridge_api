import { ProjectMemberRole } from "@app/common/enum";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../share/entities/base.entity";

@Entity('project_members')
export class ProjectMember extends BaseEntity {
  @Column()
  projectId: string;

  @Column()
  userId: string;

  @Column()
  role: ProjectMemberRole;

  @Column({ nullable: true })
  deletedAt: Date;
}
