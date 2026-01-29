import { PartialType } from '@nestjs/mapped-types';
import { CreateSkillDto } from './create-skill.dto';

/**
 * DTO for updating a skill
 */
export class UpdateSkillDto extends PartialType(CreateSkillDto) {}
