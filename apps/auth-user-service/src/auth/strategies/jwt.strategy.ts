
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('auth.jwt_secret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const rawToken = req.headers['authorization'].split(' ')[1];
    const storedToken = await this.cacheManager.get(`userToken:${payload.sub}`);
    console.log("🚀 ~ JwtStrategy ~ validate ~ storedToken:", storedToken)
    
    if (rawToken === storedToken) {
      return { userId: payload.sub, email: payload.email };
    }
    

    return false;
  }
}
