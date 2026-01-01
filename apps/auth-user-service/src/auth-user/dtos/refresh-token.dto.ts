// refresh-token.dto.ts
export class RefreshTokenDto {
  userId: string;
  deviceId: string;
  refreshToken: string;
  deviceInfo: string;
}