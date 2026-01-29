import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../entities/skill.entity';
import { Profile } from '../entities/profile.entity';
import { CreateSkillDto, CreateSkillsDto } from '../dtos/skill/create-skill.dto';
import { UpdateSkillDto } from '../dtos/skill/update-skill.dto';
import { plainToInstance } from 'class-transformer';
import { SkillResponseDto } from '../dtos/skill/skill-response.dto';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  /**
   * Add a single skill to a profile
   */
  async create(
    userId: string,
    createSkillDto: CreateSkillDto,
  ): Promise<SkillResponseDto> {
    const profile = await this.getProfileByUserId(userId);

    const skill = this.skillRepository.create({
      profileId: profile.id,
      ...createSkillDto,
    });

    const savedSkill = await this.skillRepository.save(skill);

    return plainToInstance(SkillResponseDto, savedSkill, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Add multiple skills to a profile
   */
  async createMany(
    userId: string,
    createSkillsDto: CreateSkillsDto,
  ): Promise<SkillResponseDto[]> {
    const profile = await this.getProfileByUserId(userId);

    const skills = createSkillsDto.skills.map((skillDto) =>
      this.skillRepository.create({
        profileId: profile.id,
        ...skillDto,
      }),
    );

    const savedSkills = await this.skillRepository.save(skills);

    return savedSkills.map((skill) =>
      plainToInstance(SkillResponseDto, skill, {
        excludeExtraneousValues: true,
      }),
    );
  }

  /**
   * Get all skills for a profile
   */
  async findAllByUserId(userId: string): Promise<SkillResponseDto[]> {
    const profile = await this.getProfileByUserId(userId);

    const skills = await this.skillRepository.find({
      where: { profileId: profile.id },
      order: { name: 'ASC' },
    });

    return skills.map((skill) =>
      plainToInstance(SkillResponseDto, skill, {
        excludeExtraneousValues: true,
      }),
    );
  }

  /**
   * Update a skill
   */
  async update(
    userId: string,
    skillId: string,
    updateSkillDto: UpdateSkillDto,
  ): Promise<SkillResponseDto> {
    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
      relations: ['profile'],
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${skillId} not found`);
    }

    // Check authorization
    if (skill.profile.userId !== userId) {
      throw new ForbiddenException('You can only update your own skills');
    }

    Object.assign(skill, updateSkillDto);

    const updatedSkill = await this.skillRepository.save(skill);

    return plainToInstance(SkillResponseDto, updatedSkill, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Delete a skill
   */
  async delete(userId: string, skillId: string): Promise<void> {
    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
      relations: ['profile'],
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${skillId} not found`);
    }

    // Check authorization
    if (skill.profile.userId !== userId) {
      throw new ForbiddenException('You can only delete your own skills');
    }

    await this.skillRepository.remove(skill);
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
