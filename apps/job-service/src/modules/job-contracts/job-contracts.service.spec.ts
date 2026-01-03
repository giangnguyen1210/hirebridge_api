import { Test, TestingModule } from '@nestjs/testing';
import { JobContractsService } from './job-contracts.service';

describe('JobContractsService', () => {
  let service: JobContractsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobContractsService],
    }).compile();

    service = module.get<JobContractsService>(JobContractsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
