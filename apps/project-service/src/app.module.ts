import { Module } from '@nestjs/common';
import { ProjectServiceController } from './app.controller';
import { ProjectServiceService } from './app.service';

@Module({
  imports: [],
  controllers: [ProjectServiceController],
  providers: [ProjectServiceService],
})
export class ProjectServiceModule {}
