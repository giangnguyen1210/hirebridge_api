import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { UnitOfWork } from './common/database/unit-of-work';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import { CacheModule } from '@nestjs/cache-manager';
import redisStore from 'cache-manager-redis-store';
import { CommonModule } from '@app/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UserContextGuard } from '@app/common/guards';
import { ClassSerializerInterceptor } from '@nestjs/common';

@Global()
@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisHost = config.get<string>('redis.host') || 'localhost';
        const redisPort = config.get<number>('redis.port') || 6379;

        return {
          store: redisStore as any,
          host: redisHost,
          port: redisPort,
          ttl: 0, // 0 = no expiration (we'll handle TTL per key)
          // Retry strategy for Redis connection
          retry_strategy: (options: any) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              console.error('❌ Redis connection refused. Retrying...');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
              // End reconnecting after a specific timeout
              return new Error('Redis retry time exhausted');
            }
            if (options.attempt > 10) {
              // End reconnecting with built in error
              return undefined;
            }
            // Reconnect after
            return Math.min(options.attempt * 100, 3000);
          },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const host = configService.get('database.host');
        const port = configService.get<number>('database.postgres_port');
        const user = configService.get('database.postgres_user');
        const pass = configService.get('database.postgres_password');
        const dbname = configService.get('database.postgres_db');

        console.log('❤️ DATABASE CONFIG:');
        console.log({
          host,
          port,
          user,
          pass,
          dbname,
        });

        return {
          type: 'postgres',
          host,
          port,
          username: user,
          password: pass,
          database: dbname,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    ProfileModule,
    
  ],
  providers: [
    AppService, 
    UnitOfWork, 
    {
      provide: APP_GUARD,
      useClass: UserContextGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
  exports: [UnitOfWork],
})
export class AppModule {}
