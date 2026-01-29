import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class FilterProjectDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  jobId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  createdBy: string;
}