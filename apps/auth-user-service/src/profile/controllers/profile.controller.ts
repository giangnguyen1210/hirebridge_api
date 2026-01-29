import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ProfileService } from '../services/profile.service';
import { SkillService } from '../services/skill.service';
import { ExperienceService } from '../services/experience.service';
import { CertificateService } from '../services/certificate.service';
import { CreateProfileDto } from '../dtos/profile/create-profile.dto';
import { UpdateProfileDto } from '../dtos/profile/update-profile.dto';
import { CreateSkillDto, CreateSkillsDto } from '../dtos/skill/create-skill.dto';
import { UpdateSkillDto } from '../dtos/skill/update-skill.dto';
import { CreateExperienceDto } from '../dtos/experience/create-experience.dto';
import { UpdateExperienceDto } from '../dtos/experience/update-experience.dto';
import { CreateCertificateDto } from '../dtos/certificate/create-certificate.dto';
import { UpdateCertificateDto } from '../dtos/certificate/update-certificate.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly skillService: SkillService,
    private readonly experienceService: ExperienceService,
    private readonly certificateService: CertificateService,
  ) {}

  // ========== Profile Endpoints ==========

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new profile' })
  async createProfile(@Request() req, @Body() createProfileDto: CreateProfileDto) {
    const userId = req.user.id;
    const profile = await this.profileService.create(userId, createProfileDto);
    return {
      message: 'Profile created successfully',
      data: profile,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own profile with all related data' })
  async getMyProfile(@Request() req) {
    const userId = req.user.id;
    const profile = await this.profileService.findByUserId(userId, true);
    return {
      message: 'Profile retrieved successfully',
      data: profile,
    };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get profile by user ID (public or own)' })
  async getProfileByUserId(
    @Param('userId') userId: string,
    @Query('includeRelations') includeRelations?: string,
  ) {
    const include = includeRelations === 'true';
    const profile = await this.profileService.findByUserId(userId, include);
    return {
      message: 'Profile retrieved successfully',
      data: profile,
    };
  }

  @Get(':profileId')
  @ApiOperation({ summary: 'Get profile by profile ID' })
  async getProfileById(
    @Param('profileId') profileId: string,
    @Query('includeRelations') includeRelations?: string,
  ) {
    const include = includeRelations === 'true';
    const profile = await this.profileService.findById(profileId, include);
    return {
      message: 'Profile retrieved successfully',
      data: profile,
    };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own profile' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.id;
    const profile = await this.profileService.update(userId, updateProfileDto);
    return {
      message: 'Profile updated successfully',
      data: profile,
    };
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete own profile' })
  async deleteProfile(@Request() req) {
    const userId = req.user.id;
    await this.profileService.delete(userId);
  }

  @Post('batch')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get multiple profiles by user IDs (for inter-service communication)' })
  async getBatchProfiles(@Body() body: { userIds: string[] }) {
    const profiles = await this.profileService.findByUserIds(body.userIds);
    return {
      message: 'Profiles retrieved successfully',
      data: profiles,
    };
  }

  @Get('search/freelancers')
  @ApiOperation({ summary: 'Search freelancer profiles by skills' })
  async searchFreelancers(
    @Query('skills') skills?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const skillNames = skills ? skills.split(',') : [];
    const result = await this.profileService.searchFreelancersBySkills(
      skillNames,
      +page,
      +limit,
    );
    return {
      message: 'Freelancers retrieved successfully',
      ...result,
    };
  }

  // ========== Skill Endpoints ==========

  @Post('me/skills')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a skill to own profile' })
  async addSkill(@Request() req, @Body() createSkillDto: CreateSkillDto) {
    const userId = req.user.id;
    const skill = await this.skillService.create(userId, createSkillDto);
    return {
      message: 'Skill added successfully',
      data: skill,
    };
  }

  @Post('me/skills/batch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add multiple skills to own profile' })
  async addSkills(@Request() req, @Body() createSkillsDto: CreateSkillsDto) {
    const userId = req.user.id;
    const skills = await this.skillService.createMany(userId, createSkillsDto);
    return {
      message: 'Skills added successfully',
      data: skills,
    };
  }

  @Get('me/skills')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all skills for own profile' })
  async getMySkills(@Request() req) {
    const userId = req.user.id;
    const skills = await this.skillService.findAllByUserId(userId);
    return {
      message: 'Skills retrieved successfully',
      data: skills,
    };
  }

  @Patch('me/skills/:skillId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a skill' })
  async updateSkill(
    @Request() req,
    @Param('skillId') skillId: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    const userId = req.user.id;
    const skill = await this.skillService.update(userId, skillId, updateSkillDto);
    return {
      message: 'Skill updated successfully',
      data: skill,
    };
  }

  @Delete('me/skills/:skillId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a skill' })
  async deleteSkill(@Request() req, @Param('skillId') skillId: string) {
    const userId = req.user.id;
    await this.skillService.delete(userId, skillId);
  }

  // ========== Experience Endpoints ==========

  @Post('me/experiences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add an experience to own profile' })
  async addExperience(@Request() req, @Body() createExperienceDto: CreateExperienceDto) {
    const userId = req.user.id;
    const experience = await this.experienceService.create(userId, createExperienceDto);
    return {
      message: 'Experience added successfully',
      data: experience,
    };
  }

  @Get('me/experiences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all experiences for own profile' })
  async getMyExperiences(@Request() req) {
    const userId = req.user.id;
    const experiences = await this.experienceService.findAllByUserId(userId);
    return {
      message: 'Experiences retrieved successfully',
      data: experiences,
    };
  }

  @Patch('me/experiences/:experienceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an experience' })
  async updateExperience(
    @Request() req,
    @Param('experienceId') experienceId: string,
    @Body() updateExperienceDto: UpdateExperienceDto,
  ) {
    const userId = req.user.id;
    const experience = await this.experienceService.update(
      userId,
      experienceId,
      updateExperienceDto,
    );
    return {
      message: 'Experience updated successfully',
      data: experience,
    };
  }

  @Delete('me/experiences/:experienceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an experience' })
  async deleteExperience(
    @Request() req,
    @Param('experienceId') experienceId: string,
  ) {
    const userId = req.user.id;
    await this.experienceService.delete(userId, experienceId);
  }

  // ========== Certificate Endpoints ==========

  @Post('me/certificates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a certificate to own profile' })
  async addCertificate(
    @Request() req,
    @Body() createCertificateDto: CreateCertificateDto,
  ) {
    const userId = req.user.id;
    const certificate = await this.certificateService.create(
      userId,
      createCertificateDto,
    );
    return {
      message: 'Certificate added successfully',
      data: certificate,
    };
  }

  @Get('me/certificates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all certificates for own profile' })
  async getMyCertificates(@Request() req) {
    const userId = req.user.id;
    const certificates = await this.certificateService.findAllByUserId(userId);
    return {
      message: 'Certificates retrieved successfully',
      data: certificates,
    };
  }

  @Patch('me/certificates/:certificateId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a certificate' })
  async updateCertificate(
    @Request() req,
    @Param('certificateId') certificateId: string,
    @Body() updateCertificateDto: UpdateCertificateDto,
  ) {
    const userId = req.user.id;
    const certificate = await this.certificateService.update(
      userId,
      certificateId,
      updateCertificateDto,
    );
    return {
      message: 'Certificate updated successfully',
      data: certificate,
    };
  }

  @Delete('me/certificates/:certificateId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a certificate' })
  async deleteCertificate(
    @Request() req,
    @Param('certificateId') certificateId: string,
  ) {
    const userId = req.user.id;
    await this.certificateService.delete(userId, certificateId);
  }
}
