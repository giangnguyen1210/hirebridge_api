import { Test, TestingModule } from '@nestjs/testing';
import { ProjectServiceController } from './app.controller';
import { ProjectServiceService } from './app.service';

describe('ProjectServiceController', () => {
  let projectServiceController: ProjectServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProjectServiceController],
      providers: [ProjectServiceService],
    }).compile();

    projectServiceController = app.get<ProjectServiceController>(ProjectServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(projectServiceController.getHello()).toBe('Hello World!');
    });
  });
});
