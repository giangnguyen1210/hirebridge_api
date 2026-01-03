import { Test, TestingModule } from '@nestjs/testing';
import { JobContractsController } from './job-contracts.controller';
import { JobContractsService } from './job-contracts.service';

describe('JobContractsController', () => {
  let controller: JobContractsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobContractsController],
      providers: [JobContractsService],
    }).compile();

    controller = module.get<JobContractsController>(JobContractsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
