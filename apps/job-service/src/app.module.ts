import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './modules/jobs/jobs.module';
import { JobBidsModule } from './modules/job-bids/job-bids.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JobContractsModule } from './modules/job-contracts/job-contracts.module';
import { CacheModule } from '@nestjs/cache-manager';
import redisStore from 'cache-manager-redis-store';
import { UserClientModule } from './modules/user-client/user-client.module';
import configuration from './config/configuration';





@Module({
  imports: [
    JobsModule,
    JobBidsModule,
    UserClientModule,
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

        console.log('💾 REDIS CONFIG:', { host: redisHost, port: redisPort });

        return {
          store: redisStore as any,
          host: redisHost,
          port: redisPort,
          ttl: 300, // 5 minutes default TTL
          // Retry strategy for Redis connection
          retry_strategy: (options: any) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              console.error('❌ Redis connection refused. Retrying...');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
              return new Error('Redis retry time exhausted');
            }
            if (options.attempt > 10) {
              return undefined;
            }
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
    JobContractsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    // {
    //   provide: APP_GUARD,
    //   useClass: UserContextGuard,
    // }
  ],
})
export class JobServiceModule {}
