import { IsOptional, IsString } from "class-validator";

export class AuditDto {
    @IsString()
    @IsOptional()
    createdBy?: string;
  
    @IsString()
    @IsOptional()
    updatedBy?: string;
}