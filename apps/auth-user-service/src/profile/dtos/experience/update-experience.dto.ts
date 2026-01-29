import { PartialType } from '@nestjs/mapped-types';
import { CreateExperienceDto } from './create-experience.dto';

/**
 * DTO for updating an experience
 */
export class UpdateExperienceDto extends PartialType(CreateExperienceDto) {}
