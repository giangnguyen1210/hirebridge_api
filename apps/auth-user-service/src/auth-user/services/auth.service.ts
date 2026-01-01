import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { RefreshTokenService } from './refresh-token.service';
import { BadRequestException, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { LoginDto } from "../dtos/login.dto";
import { UsersService } from "./user.service";
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
    const tokens = await this.generateTokens(payload.sub, payload.email);

    await this.cacheManager.set(`userToken:${payload.sub}`, tokens.access_token);

    const hash = await bcrypt.hash(tokens.refresh_token, 10);

    const rtDto = new RefreshTokenDto();
    rtDto.userId = payload.sub;
    rtDto.deviceId = loginDto.deviceId;
    rtDto.refreshToken = hash;
    rtDto.deviceInfo = loginDto.deviceInfo;
    await this.refreshTokenService.updateOrCreateRefreshToken(rtDto);
    
    return tokens;
  }

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
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
        // Tìm thấy đúng token của thiết bị này -> Xóa nó đi
        updateRt = rtEntity;
        break; 
      }
    }
    if (!updateRt) throw new ForbiddenException('Access Denied');

    const tokens = await this.generateTokens(userId, updateRt.user.email);
    const newHash = await bcrypt.hash(tokens.refresh_token, 10);
    const updateDto = new RefreshTokenDto();
    updateDto.refreshToken = newHash;
    await this.refreshTokenService.updateRefreshToken(updateRt, updateDto);
    
    await this.cacheManager.set(`userToken:${userId}`, tokens.access_token, 0);

    return tokens;
  }

   async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
