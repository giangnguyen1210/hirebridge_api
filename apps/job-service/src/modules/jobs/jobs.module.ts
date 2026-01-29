import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobRepository } from './repository/job.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobEntity } from './entities/job.entity';
import { UserClientModule } from '../user-client/user-client.module';


@Module({
  controllers: [JobsController],
  providers: [
    JobsService,
    JobRepository
  ],
  exports: [
    JobsService,
    JobRepository
  ],
  imports: [
    TypeOrmModule.forFeature([
      JobEntity,
    ]),
    UserClientModule,
  ]
})
export class JobsModule {}
