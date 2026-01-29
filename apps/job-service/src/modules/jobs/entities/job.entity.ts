import { JobStatus, JobType } from "@app/common";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../share/entities/base.entity";

@Entity('jobs')
export class JobEntity extends BaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  budgetMin: number;
  
  @Column({ nullable: true })
  budgetMax: number;

  @Column({ default: false })
  isNeedGroup: boolean;

  @Column({ default: JobStatus.OPEN })
  status: JobStatus;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  jobType: JobType;

  @Column({ nullable: true })
  deadline: Date;

  @Column({ type: 'text', array: true, nullable: true })
  skills: string[];
}
