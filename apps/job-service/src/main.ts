import { NestFactory, Reflector } from '@nestjs/core';
import { JobServiceModule } from './app.module';
import { UserContextInterceptor } from '@app/common/interceptors/user-context.interceptor';
import { AllExceptionsFilter, TransformInterceptor } from '@app/common';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(JobServiceModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new UserContextInterceptor(), new TransformInterceptor(app.get(Reflector)));

  await app.listen(process.env.JOB_PORT ?? 6061);
}
bootstrap();
