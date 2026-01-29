import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '../../common/entities/base.entity';
import type { Skill } from './skill.entity';
import { Experience } from './experience.entity';
import { Certificate } from './certificate.entity';

/**
 * Profile Type Enum
 * Discriminator for different profile types
 */
export enum ProfileType {
  FREELANCER = 'FREELANCER',
  CLIENT = 'CLIENT',
}

/**
 * Availability Enum for Freelancers
 */
export enum FreelancerAvailability {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  HOURLY = 'HOURLY',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
}

/**
 * Company Size Enum for Clients
 */
export enum CompanySize {
  SOLO = '1',
  SMALL = '2-10',
  MEDIUM = '11-50',
  LARGE = '51-200',
  ENTERPRISE = '201-500',
  MEGA = '501+',
}

/**
 * Profile Entity
 * Single table inheritance pattern for Freelancer and Client profiles
 */
@Entity('profiles')
export class Profile extends BaseEntity {
  // ===== Link to User (One-to-One) =====
  @Column({ unique: true })
  userId: string;

  @OneToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  // ===== Discriminator for profile type =====
  @Column({
    type: 'enum',
    enum: ProfileType,
  })
  profileType: ProfileType;

  // ===== Common fields (both Freelancer and Client) =====
  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  website: string;

  // ===== Freelancer-specific fields =====
  @Column({ nullable: true })
  title: string; // Professional title (e.g., "Senior Full-Stack Developer")

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({
    type: 'enum',
    enum: FreelancerAvailability,
    nullable: true,
  })
  availability: FreelancerAvailability;

  @Column({ type: 'int', default: 0 })
  completedProjects: number; // Number of completed projects

  // ===== Client-specific fields =====
  @Column({ nullable: true })
  companyName: string;

  @Column({
    type: 'enum',
    enum: CompanySize,
    nullable: true,
  })
  companySize: CompanySize;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  companyDescription: string;

  // ===== Profile Metadata =====
  @Column({ type: 'int', default: 0 })
  completenessScore: number; // 0-100, calculated based on filled fields

  @Column({ default: true })
  isPublic: boolean; // Whether profile is publicly visible

  @Column({ default: false })
  isVerified: boolean; // Whether profile has been verified

  // ===== Relationships =====
  @OneToMany('Skill', (skill: any) => skill.profile, {
    cascade: true,
    eager: false,
  })
  skills: Skill[];

  @OneToMany('Experience', (exp: any) => exp.profile, {
    cascade: true,
    eager: false,
  })
  experiences: Experience[];

  @OneToMany('Certificate', (cert: any) => cert.profile, {
    cascade: true,
    eager: false,
  })
  certificates: Certificate[];

  // ===== Helper Methods =====

  /**
   * Check if profile is for a freelancer
   */
  isFreelancer(): boolean {
    return this.profileType === ProfileType.FREELANCER;
  }

  /**
   * Check if profile is for a client
   */
  isClient(): boolean {
    return this.profileType === ProfileType.CLIENT;
  }

  /**
   * Calculate profile completeness score (0-100)
   * This can be called after loading related entities
   */
  calculateCompleteness(): number {
    let score = 0;

    // Common fields (40 points)
    if (this.bio) score += 10;
    if (this.avatar) score += 10;
    if (this.phone) score += 5;
    if (this.location) score += 5;
    if (this.website) score += 10;

    if (this.isFreelancer()) {
      // Freelancer-specific fields (60 points)
      if (this.title) score += 15;
      if (this.hourlyRate) score += 10;
      if (this.availability) score += 5;
      if (this.skills && this.skills.length > 0) score += 15;
      if (this.experiences && this.experiences.length > 0) score += 10;
      if (this.certificates && this.certificates.length > 0) score += 5;
    } else if (this.isClient()) {
      // Client-specific fields (60 points)
      if (this.companyName) score += 20;
      if (this.companySize) score += 10;
      if (this.industry) score += 15;
      if (this.companyDescription) score += 15;
    }

    this.completenessScore = Math.min(score, 100);
    return this.completenessScore;
  }
}
