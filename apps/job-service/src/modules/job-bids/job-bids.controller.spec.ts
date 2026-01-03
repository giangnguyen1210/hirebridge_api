import { Test, TestingModule } from '@nestjs/testing';
import { JobBidsController } from './job-bids.controller';
import { JobBidsService } from './job-bids.service';

describe('JobBidsController', () => {
  let controller: JobBidsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobBidsController],
      providers: [JobBidsService],
    }).compile();

    controller = module.get<JobBidsController>(JobBidsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
