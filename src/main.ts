import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionsFilter } from './core/filters/exceptions-filter';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

const { API_PREFIX, PORT } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));
  app.enableCors();
  app.useGlobalFilters(new ExceptionsFilter());
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(PORT || 3000);
}
bootstrap();
