import { JobStatus, AuditDto } from "@app/common";
import { ApiProperty   } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateJobDto extends AuditDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  budgetMin: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  budgetMax: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isNeedGroup: boolean;

  @ApiProperty({
    default: JobStatus.OPEN
  })
  @IsEnum(JobStatus)
  @IsOptional()
  status: JobStatus;

  @ApiProperty()
  @IsString()
  @IsOptional()
  jobType: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  location: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  deadline: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  skills: string[];
}
