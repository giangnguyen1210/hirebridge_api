import { Exclude, Expose } from 'class-transformer';

/**
 * Response DTO for Experience
 */
@Exclude()
export class ExperienceResponseDto {
  @Expose()
  id: string;

  @Expose()
  profileId: string;

  @Expose()
  title: string;

  @Expose()
  company: string;

  @Expose()
  location: string;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;

  @Expose()
  isCurrent: boolean;

  @Expose()
  description: string;

  @Expose()
  technologies: string[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
