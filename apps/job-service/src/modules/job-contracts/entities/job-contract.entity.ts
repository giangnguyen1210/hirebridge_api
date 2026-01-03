import {
  Column,
  Entity,
} from 'typeorm';
import { BaseEntity } from '../../share/entities/base.entity';
import { JobContractStatus, PaymentType } from '@app/common';

@Entity('job_contracts')
export class JobContract extends BaseEntity {
  @Column()
  userId: string;
  
  @Column()
  jobId: string;

  @Column()
  terms: string;

  @Column()
  status: JobContractStatus;

  @Column({ nullable: true })
  signedAt: Date;

  @Column({ nullable: true })
  voidedAt: Date;

  @Column()
  paymentType: PaymentType;

  @Column({ nullable: true })
  hourlyRate: number;

  @Column({ nullable: true })
  fixedPrice: number;
}
