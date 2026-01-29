import { Injectable } from "@nestjs/common";
import { RefreshToken } from "../entities/refresh-token.entity";
import { RefreshTokenDto } from "../dtos/refresh-token.dto";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";

@Injectable()
export class RefreshTokenService {
  constructor(private readonly rtRepository: RefreshTokenRepository) {}

  async updateOrCreateRefreshToken(dto: RefreshTokenDto): Promise<RefreshToken> {
    const existingToken = await this.findExistRt(dto.userId, dto.deviceId);

    if (existingToken) {
      return await this.updateRefreshToken(existingToken, dto);
    } else {
      dto.deviceInfo = "hehehe";
      return await this.createRefreshToken(dto);
    }
  }

  async findExistRt(userId: string, deviceId: string): Promise<RefreshToken | null> {
    return await this.rtRepository.findOne({
      where: { userId, deviceId },
    });
  }

  async findExistRts(userId: string): Promise<RefreshToken[]> {
    return await this.rtRepository.find({
      where: { userId },
      relations: { 
        user: true
      },
    });
  }

  private async createRefreshToken(dto: RefreshTokenDto): Promise<RefreshToken> {
    const newToken = this.rtRepository.create({
      userId: dto.userId,
      deviceId: dto.deviceId,
      refreshToken: dto.refreshToken,
      deviceInfo: dto.deviceInfo,
    });
    return await this.rtRepository.save(newToken);
  }

  async updateRefreshToken(existingToken: RefreshToken, dto: RefreshTokenDto): Promise<RefreshToken> {
    existingToken.refreshToken = dto.refreshToken;
    existingToken.deviceInfo = dto.deviceInfo;
    return await this.rtRepository.save(existingToken);
  }

  /**
   * Remove refresh token for a specific device (logout from one device)
   */
  async removeRefreshToken(userId: string, deviceId: string): Promise<void> {
    await this.rtRepository.delete({
      userId,
      deviceId,
    });
  }

  /**
   * Remove all refresh tokens for a user (logout from all devices)
   */
  async removeAllRefreshTokens(userId: string): Promise<void> {
    await this.rtRepository.delete({
      userId,
    });
  }
}