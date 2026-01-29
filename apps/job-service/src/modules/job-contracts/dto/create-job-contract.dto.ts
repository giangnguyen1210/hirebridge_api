import { JobContractStatus, PaymentType } from "@app/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateJobContractDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  representativeAId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  representativeBId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  terms: string;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty()
  @IsEnum(PaymentType)
  @IsNotEmpty()
  paymentType: PaymentType;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  hourlyRate: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  fixedPrice: number;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  signedAt: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  voidedAt: Date;

  @ApiProperty()
  @IsEnum(JobContractStatus)
  @IsNotEmpty()
  status: JobContractStatus;
}
