import { ProjectMemberRole } from "@app/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class FilterProjectMemberDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  projectId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  userId: string;

  @ApiProperty()
  @IsEnum(ProjectMemberRole)
  @IsOptional()
  role: string;

  @ApiProperty()
  @IsOptional()
  deletedAt: Date;
}