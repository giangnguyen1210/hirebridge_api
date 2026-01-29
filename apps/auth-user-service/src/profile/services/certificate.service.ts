import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../entities/certificate.entity';
import { Profile } from '../entities/profile.entity';
import { CreateCertificateDto } from '../dtos/certificate/create-certificate.dto';
import { UpdateCertificateDto } from '../dtos/certificate/update-certificate.dto';
import { plainToInstance } from 'class-transformer';
import { CertificateResponseDto } from '../dtos/certificate/certificate-response.dto';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  /**
   * Add a certificate to a profile
   */
  async create(
    userId: string,
    createCertificateDto: CreateCertificateDto,
  ): Promise<CertificateResponseDto> {
    const profile = await this.getProfileByUserId(userId);

    const certificate = this.certificateRepository.create({
      profileId: profile.id,
      ...createCertificateDto,
    });

    const savedCertificate = await this.certificateRepository.save(certificate);

    return plainToInstance(CertificateResponseDto, savedCertificate, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Get all certificates for a profile
   */
  async findAllByUserId(userId: string): Promise<CertificateResponseDto[]> {
    const profile = await this.getProfileByUserId(userId);

    const certificates = await this.certificateRepository.find({
      where: { profileId: profile.id },
      order: { issueDate: 'DESC' }, // Most recent first
    });

    return certificates.map((cert) =>
      plainToInstance(CertificateResponseDto, cert, {
        excludeExtraneousValues: true,
      }),
    );
  }

  /**
   * Update a certificate
   */
  async update(
    userId: string,
    certificateId: string,
    updateCertificateDto: UpdateCertificateDto,
  ): Promise<CertificateResponseDto> {
    const certificate = await this.certificateRepository.findOne({
      where: { id: certificateId },
      relations: ['profile'],
    });

    if (!certificate) {
      throw new NotFoundException(
        `Certificate with ID ${certificateId} not found`,
      );
    }

    // Check authorization
    if (certificate.profile.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own certificates',
      );
    }

    Object.assign(certificate, updateCertificateDto);

    const updatedCertificate = await this.certificateRepository.save(
      certificate,
    );

    return plainToInstance(CertificateResponseDto, updatedCertificate, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Delete a certificate
   */
  async delete(userId: string, certificateId: string): Promise<void> {
    const certificate = await this.certificateRepository.findOne({
      where: { id: certificateId },
      relations: ['profile'],
    });

    if (!certificate) {
      throw new NotFoundException(
        `Certificate with ID ${certificateId} not found`,
      );
    }

    // Check authorization
    if (certificate.profile.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own certificates',
      );
    }

    await this.certificateRepository.remove(certificate);
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
