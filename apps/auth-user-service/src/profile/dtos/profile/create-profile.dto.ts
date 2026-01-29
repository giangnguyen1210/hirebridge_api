import {
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUrl,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import {
  ProfileType,
  FreelancerAvailability,
  CompanySize,
} from '../../entities/profile.entity';

/**
 * Base DTO for creating a profile
 */
export class CreateProfileDto {
  @IsEnum(ProfileType)
  profileType: ProfileType;

  // Common fields
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  // Freelancer-specific fields
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  hourlyRate?: number;

  @IsOptional()
  @IsEnum(FreelancerAvailability)
  availability?: FreelancerAvailability;

  // Client-specific fields
  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string;

  @IsOptional()
  @IsEnum(CompanySize)
  companySize?: CompanySize;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  companyDescription?: string;

  // Metadata
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
