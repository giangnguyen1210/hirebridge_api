import { PartialType } from '@nestjs/mapped-types';
import { CreateCertificateDto } from './create-certificate.dto';

/**
 * DTO for updating a certificate
 */
export class UpdateCertificateDto extends PartialType(CreateCertificateDto) {}
