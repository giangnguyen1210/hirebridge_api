import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { UnitOfWork } from './common/database/unit-of-work';
import { AuthUsersModule } from './modules/auth-user.module';
import { CacheModule } from '@nestjs/cache-manager';
import redisStore from 'cache-manager-redis-store';
import { CommonModule } from '@app/common';
import { APP_GUARD } from '@nestjs/core';
import { UserContextGuard } from '@app/common/guards';

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
      useFactory: (config: ConfigService) => {
        console.log('redis host:', config.get('redis.host')); // sẽ log được
        console.log('redis pỏt:', config.get('redis.port')); // sẽ log được

        return {
          store: redisStore as any,
          host: config.get<string>('redis.host') || 'localhost',
          port: config.get<number>('redis.port') || 6379,
          ttl: 600,
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
    AuthUsersModule,
    
  ],
  providers: [
    AppService, 
    UnitOfWork, 
    {
      provide: APP_GUARD,
      useClass: UserContextGuard,
    },
  ],
  exports: [UnitOfWork],
})
export class AppModule {}
