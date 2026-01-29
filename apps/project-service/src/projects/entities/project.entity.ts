import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../share/entities/base.entity";

@Entity('projects')
export class Project extends BaseEntity {
  @Column()
  name: string;

  @Column({ default: '', nullable: true })
  description: string;

  @Column()
  createdBy: string;

  @Column()
  jobId: string;

  @Column({ nullable: true })
  deletedAt: Date;
}
