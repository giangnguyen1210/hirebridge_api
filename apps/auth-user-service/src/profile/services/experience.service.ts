import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experience } from '../entities/experience.entity';
import { Profile } from '../entities/profile.entity';
import { CreateExperienceDto } from '../dtos/experience/create-experience.dto';
import { UpdateExperienceDto } from '../dtos/experience/update-experience.dto';
import { plainToInstance } from 'class-transformer';
import { ExperienceResponseDto } from '../dtos/experience/experience-response.dto';

@Injectable()
export class ExperienceService {
  constructor(
    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  /**
   * Add an experience to a profile
   */
  async create(
    userId: string,
    createExperienceDto: CreateExperienceDto,
  ): Promise<ExperienceResponseDto> {
    const profile = await this.getProfileByUserId(userId);

    const experience = this.experienceRepository.create({
      profileId: profile.id,
      ...createExperienceDto,
    });

    const savedExperience = await this.experienceRepository.save(experience);

    return plainToInstance(ExperienceResponseDto, savedExperience, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Get all experiences for a profile
   */
  async findAllByUserId(userId: string): Promise<ExperienceResponseDto[]> {
    const profile = await this.getProfileByUserId(userId);

    const experiences = await this.experienceRepository.find({
      where: { profileId: profile.id },
      order: { startDate: 'DESC' }, // Most recent first
    });

    return experiences.map((exp) =>
      plainToInstance(ExperienceResponseDto, exp, {
        excludeExtraneousValues: true,
      }),
    );
  }

  /**
   * Update an experience
   */
  async update(
    userId: string,
    experienceId: string,
    updateExperienceDto: UpdateExperienceDto,
  ): Promise<ExperienceResponseDto> {
    const experience = await this.experienceRepository.findOne({
      where: { id: experienceId },
      relations: ['profile'],
    });

    if (!experience) {
      throw new NotFoundException(
        `Experience with ID ${experienceId} not found`,
      );
    }

    // Check authorization
    if (experience.profile.userId !== userId) {
      throw new ForbiddenException('You can only update your own experiences');
    }

    Object.assign(experience, updateExperienceDto);

    const updatedExperience = await this.experienceRepository.save(experience);

    return plainToInstance(ExperienceResponseDto, updatedExperience, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Delete an experience
   */
  async delete(userId: string, experienceId: string): Promise<void> {
    const experience = await this.experienceRepository.findOne({
      where: { id: experienceId },
      relations: ['profile'],
    });

    if (!experience) {
      throw new NotFoundException(
        `Experience with ID ${experienceId} not found`,
      );
    }

    // Check authorization
    if (experience.profile.userId !== userId) {
      throw new ForbiddenException('You can only delete your own experiences');
    }

    await this.experienceRepository.remove(experience);
  }

  /**
   * Helper: Get profile by user ID or throw error
   */
  private async getProfileByUserId(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found for user ${userId}`);
    }

    return profile;
  }
}
