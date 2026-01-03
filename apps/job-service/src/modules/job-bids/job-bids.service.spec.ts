import { Test, TestingModule } from '@nestjs/testing';
import { JobBidsService } from './job-bids.service';

describe('JobBidsService', () => {
  let service: JobBidsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobBidsService],
    }).compile();

    service = module.get<JobBidsService>(JobBidsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
