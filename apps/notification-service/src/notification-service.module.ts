import { Module } from '@nestjs/common';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import configuration from './config/configuration';

@Module({
  imports: [
    MailModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService],
})
export class NotificationServiceModule {}
