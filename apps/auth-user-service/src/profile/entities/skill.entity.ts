import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Profile } from './profile.entity';

/**
 * Proficiency Level Enum
 * Represents skill proficiency levels
 */
export enum ProficiencyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

/**
 * Skill Entity
 * Represents a skill associated with a freelancer profile
 */
@Entity('skills')
export class Skill extends BaseEntity {
  @ManyToOne('Profile', (profile: any) => profile.skills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column({ name: 'profile_id' })
  profileId: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ProficiencyLevel,
    default: ProficiencyLevel.INTERMEDIATE,
  })
  level: ProficiencyLevel;

  @Column({ type: 'int', default: 0 })
  yearsOfExperience: number;

  @Column({ nullable: true })
  category: string;
}
