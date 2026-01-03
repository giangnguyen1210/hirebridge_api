import { JobStatus } from "@app/common";
import { ApiProperty   } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNumber, IsString } from "class-validator";

export class CreateJobDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  budgetMin: number;

  @ApiProperty()
  @IsNumber()
  budgetMax: number;

  @ApiProperty()
  @IsBoolean()
  isNeedGroup: boolean;

  @ApiProperty()
  @IsEnum(JobStatus)
  status: JobStatus;
}
