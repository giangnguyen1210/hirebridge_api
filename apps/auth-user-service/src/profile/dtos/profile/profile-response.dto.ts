import { Exclude, Expose } from 'class-transformer';
import {
  ProfileType,
  FreelancerAvailability,
  CompanySize,
} from '../../entities/profile.entity';
import { SkillResponseDto } from '../skill/skill-response.dto';
import { ExperienceResponseDto } from '../experience/experience-response.dto';
import { CertificateResponseDto } from '../certificate/certificate-response.dto';

/**
 * Response DTO for Profile
 * Controls what data is exposed in API responses
 */
@Exclude()
export class ProfileResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  profileType: ProfileType;

  // Common fields
  @Expose()
  bio: string;

  @Expose()
  avatar: string;

  @Expose()
  phone: string;

  @Expose()
  location: string;

  @Expose()
  website: string;

  // Freelancer-specific fields
  @Expose()
  title: string;

  @Expose()
  hourlyRate: number;

  @Expose()
  availability: FreelancerAvailability;

  @Expose()
  completedProjects: number;

  // Client-specific fields
  @Expose()
  companyName: string;

  @Expose()
  companySize: CompanySize;

  @Expose()
  industry: string;

  @Expose()
  companyDescription: string;

  // Metadata
  @Expose()
  completenessScore: number;

  @Expose()
  isPublic: boolean;

  @Expose()
  isVerified: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  // Related entities (optional, loaded when needed)
  @Expose()
  skills?: SkillResponseDto[];

  @Expose()
  experiences?: ExperienceResponseDto[];

  @Expose()
  certificates?: CertificateResponseDto[];
}
