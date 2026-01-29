import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

// Entities
import { RefreshToken } from './entities/refresh-token.entity';

// Services
import { AuthService } from './services/auth.service';
import { RefreshTokenService } from './services/refresh-token.service';

// Strategies
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

// Repositories
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (cs: ConfigService) => ({
        secret: cs.get('auth.jwt_secret'),
        signOptions: { expiresIn: cs.get('auth.jwt_expires_in') || '15m' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([RefreshToken]),
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'auth',
              brokers: [
                configService.get<string>('kafka.KAFKA_BROKER') ??
                  'localhost:29092',
              ],
              retry: {
                initialRetryTime: 300,
                retries: 10,
              },
            },
            producer: {
              allowAutoTopicCreation: true,
              createPartitioner:
                require('kafkajs').Partitioners.LegacyPartitioner,
            },
            consumer: {
              groupId:
                configService.get<string>('kafka.KAFKA_GROUP_ID') ??
                'auth-user-service-group',
              autoCommit: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    UserModule, // Import UserModule để sử dụng User entity và service
  ],
  controllers: [AuthController],
  providers: [
    RefreshTokenRepository,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    RefreshTokenService,
    AuthService,
  ],
  exports: [AuthService, RefreshTokenService, JwtStrategy],
})
export class AuthModule {}
