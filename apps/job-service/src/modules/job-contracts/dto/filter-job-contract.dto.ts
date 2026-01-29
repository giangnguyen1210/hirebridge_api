import { JobContractStatus } from "@app/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsOptional } from "class-validator";
import { IsString } from "class-validator";

export class FilterJobContractDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  jobId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  representativeAId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  representativeBId: string;

  @ApiProperty()
  @IsEnum(JobContractStatus)
  @IsOptional()
  status: JobContractStatus;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  startDate: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  endDate: Date;
} 