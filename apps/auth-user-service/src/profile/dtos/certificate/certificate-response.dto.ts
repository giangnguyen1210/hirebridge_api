import { Exclude, Expose } from 'class-transformer';

/**
 * Response DTO for Certificate
 */
@Exclude()
export class CertificateResponseDto {
  @Expose()
  id: string;

  @Expose()
  profileId: string;

  @Expose()
  name: string;

  @Expose()
  issuingOrganization: string;

  @Expose()
  issueDate: Date;

  @Expose()
  expirationDate: Date;

  @Expose()
  credentialId: string;

  @Expose()
  credentialUrl: string;

  @Expose()
  doesNotExpire: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
