import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  MaxLength,
} from 'class-validator';

/**
 * DTO for creating an experience
 */
export class CreateExperienceDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  @MaxLength(200)
  company: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];
}
