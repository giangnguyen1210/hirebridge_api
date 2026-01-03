import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './modules/jobs/jobs.module';
import { JobBidsModule } from './modules/job-bids/job-bids.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JobContractsModule } from './modules/job-contracts/job-contracts.module';
import configuration from './config/configuration';

@Module({
  imports: [
    JobsModule,
    JobBidsModule, 
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
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
