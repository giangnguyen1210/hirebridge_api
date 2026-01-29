import { JobBidStatus } from "@app/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { IsString } from "class-validator";

export class FilterJobBidDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  jobId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(JobBidStatus)
  status: JobBidStatus;
} 