import { Injectable } from '@nestjs/common';
import { CreateJobBidDto } from './dto/create-job-bid.dto';
import { UpdateJobBidDto } from './dto/update-job-bid.dto';

@Injectable()
export class JobBidsService {
  create(job: CreateJobBidDto) {
    return 'This action adds a new bid';
  }

  findAll() {
    return `This action returns all bids`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bid`;
  }

  update(id: number, updateBidDto: UpdateJobBidDto) {
    return `This action updates a #${id} bid`;
  }

  remove(id: number) {
    return `This action removes a #${id} bid`;
  }
}
