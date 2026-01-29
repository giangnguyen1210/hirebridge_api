import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from './projects/projects.module';
import { ProjectMembersModule } from './project-members/project-members.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ProjectsModule,
    ProjectMembersModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
