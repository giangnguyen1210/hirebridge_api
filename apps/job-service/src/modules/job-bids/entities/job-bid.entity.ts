import { Column } from "typeorm";
import { BaseEntity } from "../../share/entities/base.entity";
import { JobBidStatus } from "@app/common";

export class JobBid extends BaseEntity {
  @Column()
  jobId: string;

  @Column()
  userId: string;

  @Column()
  status: JobBidStatus;

  @Column()
  bidPrice: number;
  
  @Column()
  coverLetter: string;
}
