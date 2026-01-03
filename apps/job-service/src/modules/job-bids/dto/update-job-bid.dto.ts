import { PartialType } from '@nestjs/swagger';
import { CreateJobBidDto } from './create-job-bid.dto';

export class UpdateJobBidDto extends PartialType(CreateJobBidDto) {}
