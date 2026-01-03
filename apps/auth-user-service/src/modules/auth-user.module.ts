import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersRepository } from './repositories/user.repository';
import { UsersController } from './controllers/user.controller';
import { UsersService } from './services/user.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenService } from './services/refresh-token.service';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserRoleEntity } from './entities/user-role.entity';
import { RoleEntity } from './entities/role.entity';
import { RoleRepository } from './repositories/role.repository';
import { UserRoleRepository } from './repositories/user-role.repository';
import { UserRoleService } from './services/user-role.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (cs: ConfigService) => ({
        secret: cs.get('auth.jwt_secret'),
        signOptions: { expiresIn: cs.get('auth.jwt_expires_in') || '15m' },
      }),
      inject: [ConfigService]
    }),
    TypeOrmModule.forFeature([
      User,
      RefreshToken,
      UserRoleEntity,
      RoleEntity,
    ]),
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'auth',
              brokers: [configService.get<string>('kafka.KAFKA_BROKER') ?? 'localhost:29092'],
              retry: {
                initialRetryTime: 300, // Chờ 300ms trước khi thử lại lần đầu
                retries: 10,           // Thử lại tối đa 10 lần (mặc định là 5)
              },
            },
            producer: {
              allowAutoTopicCreation: true, // Cho phép tự tạo topic nếu chưa có
              createPartitioner: require('kafkajs').Partitioners.LegacyPartitioner,
            },
            consumer: {
              groupId: configService.get<string>('kafka.KAFKA_GROUP_ID') ?? 'auth-user-service-group',
              autoCommit: false
            }
          }
        }),
        inject: [ConfigService]
      }
    ]), 
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersRepository,
    RefreshTokenRepository,
    RoleRepository,
    UserRoleRepository,
    LocalStrategy, 
    JwtStrategy,
    JwtRefreshStrategy,
    RefreshTokenService,
    UsersService,
    AuthService,
    UserRoleService
  ],
  exports: [UsersRepository, UsersService, AuthService, RefreshTokenService, UserRoleService],
})
export class AuthUsersModule {}
