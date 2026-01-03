import { PartialType } from '@nestjs/swagger';
import { CreateJobContractDto } from './create-job-contract.dto';

export class UpdateJobContractDto extends PartialType(CreateJobContractDto) {}
