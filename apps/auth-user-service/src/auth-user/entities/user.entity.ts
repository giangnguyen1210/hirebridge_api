import {
  Entity,
  Column,
  BeforeInsert,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from './refresh-token.entity';
import { BaseEntity } from './base.entity';
import { UserStatus } from '@app/common';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, nullable: true })
  username: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column({ type: 'varchar', nullable: true })
  activateToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  tokenExpire: Date | null;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true })
  blockedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compareSync(password, this.password);
  }
}
