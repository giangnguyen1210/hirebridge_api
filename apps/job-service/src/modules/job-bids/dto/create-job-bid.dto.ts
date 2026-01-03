import { JobBidStatus } from "@app/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateJobBidDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  bidPrice: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  coverLetter: string;

  @ApiProperty({
    default: JobBidStatus.PENDING,
  })
  @IsEnum(JobBidStatus)
  @IsNotEmpty()
  status: JobBidStatus;
}
