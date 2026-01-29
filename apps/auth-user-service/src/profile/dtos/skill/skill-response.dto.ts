import { Exclude, Expose } from 'class-transformer';
import { ProficiencyLevel } from '../../entities/skill.entity';

/**
 * Response DTO for Skill
 */
@Exclude()
export class SkillResponseDto {
  @Expose()
  id: string;

  @Expose()
  profileId: string;

  @Expose()
  name: string;

  @Expose()
  level: ProficiencyLevel;

  @Expose()
  yearsOfExperience: number;

  @Expose()
  category: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
