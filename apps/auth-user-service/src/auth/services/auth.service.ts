import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { RefreshTokenService } from './refresh-token.service';
import { BadRequestException, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { LoginDto } from "../dtos/login.dto";
import { UsersService } from "../../user/services/user.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from 'bcrypt';
import { RefreshToken } from '../entities/refresh-token.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { UserStatus } from '@app/common';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  name?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async login(user: any, loginDto: LoginDto) {
    const payload = { sub: user.id, email: user.email };
    const tokens = await this.generateTokens(payload.sub, payload.email, user.roles || []);

    // Store access token in Redis with TTL matching JWT expiration
    const jwtExpiresIn = this.configService.get('auth.jwt_expires_in') || '15m';
    const ttlSeconds = this.parseDurationToSeconds(jwtExpiresIn);

    await this.cacheManager.set(`userToken:${payload.sub}`, tokens.access_token, ttlSeconds);

    const hash = await bcrypt.hash(tokens.refresh_token, 10);

    const rtDto = new RefreshTokenDto();
    rtDto.userId = payload.sub;
    rtDto.deviceId = loginDto.deviceId;
    rtDto.refreshToken = hash;
    rtDto.deviceInfo = loginDto.deviceInfo;
    await this.refreshTokenService.updateOrCreateRefreshToken(rtDto);
    
    return {
      user,
      tokens
    }
  }

  async generateTokens(userId: string, email: string, role: string[]) {
    const payload = { sub: userId, email, role };
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('auth.jwt_secret'),
        expiresIn: this.configService.get('auth.jwt_expires_in'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('auth.jwt_refresh'),
        expiresIn: this.configService.get('auth.jwt_refresh_expires_in'),
      })
    ]);
    return { access_token: at, refresh_token: rt};
  }

  async validateUser(email: string, plainPassword: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException(
        `User #${email} not existed | Người dùng không tồn tại`,
      );
    }

    if (!user.comparePassword(plainPassword)) {
      throw new BadRequestException(`Invalid password | Sai mật mã`);
    }

    if (user.status === UserStatus.PENDING) {
      throw new BadRequestException(
        `User #${email} not activated yet | Chưa kích hoạt bằng xác minh email`,
      );
    }

    if (user.status === UserStatus.BANNED) {
      throw new BadRequestException(
        `User #${email} were temporary blocked | Tài khoản đã bị khoá`,
      );
    }

    const { ...validUser } = user;

    return validUser;
  }

  async refreshToken(userId: string, rftoken: string) {
    const existRts = await this.refreshTokenService.findExistRts(userId);
    let updateRt: RefreshToken | null = null;
    for (const rtEntity of existRts) {
      const isMatch = await bcrypt.compare(rftoken, rtEntity.refreshToken);
      if (isMatch) {
        updateRt = rtEntity;
        break; 
      }
    }
    if (!updateRt) throw new ForbiddenException('Access Denied');

    const tokens = await this.generateTokens(userId, updateRt.user.email, updateRt.user.roles || []);
    const newHash = await bcrypt.hash(tokens.refresh_token, 10);
    const updateDto = new RefreshTokenDto();
    updateDto.refreshToken = newHash;
    await this.refreshTokenService.updateRefreshToken(updateRt, updateDto);
    
    // Store new access token in Redis with TTL
    const jwtExpiresIn = this.configService.get('auth.jwt_expires_in') || '15m';
    const ttlSeconds = this.parseDurationToSeconds(jwtExpiresIn);
    await this.cacheManager.set(`userToken:${userId}`, tokens.access_token, ttlSeconds);

    return tokens;
  }

   async verifyToken(token: string): Promise<TokenPayload> {
    try {
      // Step 1: Verify JWT signature and expiration
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // Step 2: Check if token exists in Redis cache (CRITICAL for logout security)
      const cachedToken = await this.cacheManager.get(`userToken:${payload.sub}`);

      if (!cachedToken) {
        // Token not in cache = User logged out or token was invalidated
        console.log('⚠️ [SECURITY] Token not found in Redis cache - User may have logged out');
        throw new UnauthorizedException('Token has been invalidated');
      }

      if (cachedToken !== token) {
        // Token in cache doesn't match = Possible stolen/old token
        console.log('⚠️ [SECURITY] Token mismatch in Redis cache - Possible security issue');
        throw new UnauthorizedException('Token mismatch - security violation');
      }

      console.log('✅ [SECURITY] Token validated: JWT signature + Redis cache check passed');
      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Parse duration string (e.g., '15m', '1h', '7d') to seconds
   */
  private parseDurationToSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 900;
    }
  }

  /**
   * Logout user from a specific device
   * - Removes refresh token from database
   * - Clears access token from cache
   */
  async logout(userId: string, deviceId?: string): Promise<void> {
    // Remove refresh token from database
    if (deviceId) {
      // Logout from specific device
      await this.refreshTokenService.removeRefreshToken(userId, deviceId);
    } else {
      // Logout from all devices
      await this.refreshTokenService.removeAllRefreshTokens(userId);
    }

    // Clear access token from cache
    await this.cacheManager.del(`userToken:${userId}`);
  }
}
