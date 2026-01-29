import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile, ProfileType } from '../entities/profile.entity';
import { User } from '../../user/entities/user.entity';
import { CreateProfileDto } from '../dtos/profile/create-profile.dto';
import { UpdateProfileDto } from '../dtos/profile/update-profile.dto';
import { plainToInstance } from 'class-transformer';
import { ProfileResponseDto } from '../dtos/profile/profile-response.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new profile for a user
   * @param userId - The ID of the user creating the profile
   * @param createProfileDto - Profile data
   */
  async create(
    userId: string,
    createProfileDto: CreateProfileDto,
  ): Promise<ProfileResponseDto> {
    // 1. Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Check if profile already exists
    const existingProfile = await this.profileRepository.findOne({
      where: { userId },
    });
    if (existingProfile) {
      throw new ConflictException('Profile already exists for this user');
    }

    // 3. Validate profileType-specific fields
    this.validateProfileTypeFields(createProfileDto);

    // 4. Create profile
    const profile = this.profileRepository.create({
      userId,
      ...createProfileDto,
    });

    // 5. Calculate initial completeness score
    profile.calculateCompleteness();

    // 6. Save and return
    const savedProfile = await this.profileRepository.save(profile);

    return plainToInstance(ProfileResponseDto, savedProfile, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Get profile by user ID
   * @param userId - The user ID
   * @param includeRelations - Whether to include skills, experiences, certificates
   */
  async findByUserId(
    userId: string,
    includeRelations = false,
  ): Promise<ProfileResponseDto> {
    const relations = includeRelations
      ? ['skills', 'experiences', 'certificates']
      : [];

    const profile = await this.profileRepository.findOne({
      where: { userId },
      relations,
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found for user ${userId}`);
    }

    // Recalculate completeness if relations are loaded
    if (includeRelations) {
      profile.calculateCompleteness();
    }

    return plainToInstance(ProfileResponseDto, profile, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Get profile by profile ID
   * @param profileId - The profile ID
   * @param includeRelations - Whether to include related entities
   */
  async findById(
    profileId: string,
    includeRelations = false,
  ): Promise<ProfileResponseDto> {
    const relations = includeRelations
      ? ['skills', 'experiences', 'certificates']
      : [];

    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
      relations,
    });

    if (!profile) {
      throw new NotFoundException(`Profile with ID ${profileId} not found`);
    }

    if (includeRelations) {
      profile.calculateCompleteness();
    }

    return plainToInstance(ProfileResponseDto, profile, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Update a profile
   * @param userId - The user ID (for authorization)
   * @param updateProfileDto - Updated profile data
   */
  async update(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
      relations: ['skills', 'experiences', 'certificates'],
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found for user ${userId}`);
    }

    // Validate profileType-specific fields (profile type cannot be changed)
    this.validateUpdateFields(profile.profileType, updateProfileDto);

    // Update profile
    Object.assign(profile, updateProfileDto);

    // Recalculate completeness score
    profile.calculateCompleteness();

    const updatedProfile = await this.profileRepository.save(profile);

    return plainToInstance(ProfileResponseDto, updatedProfile, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Delete a profile
   * @param userId - The user ID
   */
  async delete(userId: string): Promise<void> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found for user ${userId}`);
    }

    await this.profileRepository.remove(profile);
  }

  /**
   * Get multiple profiles by user IDs (for inter-service communication)
   * @param userIds - Array of user IDs
   */
  async findByUserIds(
    userIds: string[],
  ): Promise<ProfileResponseDto[]> {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    const profiles = await this.profileRepository
      .createQueryBuilder('profile')
      .where('profile.userId IN (:...userIds)', { userIds })
      .getMany();

    return profiles.map((profile) =>
      plainToInstance(ProfileResponseDto, profile, {
        excludeExtraneousValues: true,
      }),
    );
  }

  /**
   * Search freelancer profiles by skills
   * @param skillNames - Array of skill names to search for
   * @param page - Page number
   * @param limit - Items per page
   */
  async searchFreelancersBySkills(
    skillNames: string[],
    page = 1,
    limit = 10,
  ): Promise<{ data: ProfileResponseDto[]; total: number; page: number; limit: number }> {
    const query = this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.skills', 'skill')
      .where('profile.profileType = :type', { type: ProfileType.FREELANCER })
      .andWhere('profile.isPublic = :isPublic', { isPublic: true });

    if (skillNames && skillNames.length > 0) {
      query.andWhere('skill.name IN (:...skillNames)', { skillNames });
    }

    // Get total count
    const total = await query.getCount();

    // Get paginated results
    const profiles = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: profiles.map((profile) =>
        plainToInstance(ProfileResponseDto, profile, {
          excludeExtraneousValues: true,
        }),
      ),
      total,
      page,
      limit,
    };
  }

  /**
   * Validate that profile type-specific fields are properly set for creation
   */
  private validateProfileTypeFields(dto: CreateProfileDto) {
    if (dto.profileType === ProfileType.FREELANCER) {
      // Freelancer profiles should not have client-specific fields
      if (dto.companyName || dto.companySize || dto.industry) {
        throw new BadRequestException(
          'Freelancer profiles cannot have company-related fields',
        );
      }
    } else if (dto.profileType === ProfileType.CLIENT) {
      // Client profiles should not have freelancer-specific fields
      if (dto.title || dto.hourlyRate || dto.availability) {
        throw new BadRequestException(
          'Client profiles cannot have freelancer-specific fields',
        );
      }
    }
  }

  /**
   * Validate update fields based on existing profile type
   */
  private validateUpdateFields(profileType: ProfileType, dto: UpdateProfileDto) {
    const freelancerFields = ['title', 'hourlyRate', 'availability'];
    const clientFields = ['companyName', 'companySize', 'industry', 'companyDescription'];
    
    if (profileType === ProfileType.FREELANCER) {
      // Check if any client fields are being set
      const hasClientFields = clientFields.some(field => (dto as any)[field] !== undefined);
      if (hasClientFields) {
        throw new BadRequestException(
          'Freelancer profiles cannot have company-related fields',
        );
      }
    } else if (profileType === ProfileType.CLIENT) {
      // Check if any freelancer fields are being set
      const hasFreelancerFields = freelancerFields.some(field => (dto as any)[field] !== undefined);
      if (hasFreelancerFields) {
        throw new BadRequestException(
          'Client profiles cannot have freelancer-specific fields',
        );
      }
    }
  }

  /**
   * Check if user can access a profile
   * @param userId - The requesting user ID
   * @param profileUserId - The profile's user ID
   */
  async checkAccess(userId: string, profileUserId: string): Promise<boolean> {
    // Users can access their own profiles
    if (userId === profileUserId) {
      return true;
    }

    // Check if profile is public
    const profile = await this.profileRepository.findOne({
      where: { userId: profileUserId },
      select: ['isPublic'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (!profile.isPublic) {
      throw new ForbiddenException('This profile is private');
    }

    return true;
  }
}
