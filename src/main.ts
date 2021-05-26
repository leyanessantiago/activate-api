import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionsFilter } from './core/filters/exceptions-filter';

const { API_PREFIX, PORT } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new ExceptionsFilter());
  app.setGlobalPrefix(API_PREFIX);
  await app.listen(PORT || 3000);
}
bootstrap();
