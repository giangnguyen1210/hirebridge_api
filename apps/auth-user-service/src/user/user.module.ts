import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

// Entities
import { User } from './entities/user.entity';

// Services
import { UsersService } from './services/user.service';

// Repositories
import { UsersRepository } from './repositories/user.repository';

// Controllers
import { UsersController } from './controllers/user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'user',
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
  ],
  providers: [UsersRepository, UsersService],
  controllers: [UsersController],
  exports: [UsersRepository, UsersService],
})
export class UserModule {}
