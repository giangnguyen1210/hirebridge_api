import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsUrl,
  MaxLength,
} from 'class-validator';

/**
 * DTO for creating a certificate
 */
export class CreateCertificateDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(200)
  issuingOrganization: string;

  @IsDateString()
  issueDate: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  credentialId?: string;

  @IsOptional()
  @IsUrl()
  credentialUrl?: string;

  @IsOptional()
  @IsBoolean()
  doesNotExpire?: boolean;
}
