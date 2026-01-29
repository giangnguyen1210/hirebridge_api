import {
  IsEnum,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ProficiencyLevel } from '../../entities/skill.entity';

/**
 * DTO for creating a skill
 */
export class CreateSkillDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEnum(ProficiencyLevel)
  level: ProficiencyLevel;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsOfExperience?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;
}

/**
 * DTO for batch creating skills
 */
export class CreateSkillsDto {
  @IsOptional()
  skills: CreateSkillDto[];
}
