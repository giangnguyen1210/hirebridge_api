import { Injectable } from '@nestjs/common';
import { CreateJobContractDto } from './dto/create-job-contract.dto';
import { UpdateJobContractDto } from './dto/update-job-contract.dto';

@Injectable()
export class JobContractsService {
  create(createJobContractDto: CreateJobContractDto) {
    return 'This action adds a new jobContract';
  }

  findAll() {
    return `This action returns all jobContracts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jobContract`;
  }

  update(id: number, updateJobContractDto: UpdateJobContractDto) {
    return `This action updates a #${id} jobContract`;
  }

  remove(id: number) {
    return `This action removes a #${id} jobContract`;
  }
}
