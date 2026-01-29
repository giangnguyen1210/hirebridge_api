import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Profile } from './entities/profile.entity';
import { Skill } from './entities/skill.entity';
import { Experience } from './entities/experience.entity';
import { Certificate } from './entities/certificate.entity';
import { User } from '../user/entities/user.entity';

// Services
import { ProfileService } from './services/profile.service';
import { SkillService } from './services/skill.service';
import { ExperienceService } from './services/experience.service';
import { CertificateService } from './services/certificate.service';

// Controllers
import { ProfileController } from './controllers/profile.controller';

// Import UserModule for User entity
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, Skill, Experience, Certificate, User]),
    UserModule,
  ],
  providers: [
    ProfileService,
    SkillService,
    ExperienceService,
    CertificateService,
  ],
  controllers: [ProfileController],
  exports: [
    ProfileService,
    SkillService,
    ExperienceService,
    CertificateService,
  ],
})
export class ProfileModule {}
