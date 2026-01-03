import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  const configService = app.get(ConfigService);

  console.log(configService.get('kafkaConfig'));
  const kafka = app.connectMicroservice(configService.get('kafkaConfig'))

  await app.startAllMicroservices();

  const server = await app.listen(6666);
  server.setTimeout(60000);
}
bootstrap();
