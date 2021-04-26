import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionsFilter } from './core/filters/exceptions-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new ExceptionsFilter());
  app.setGlobalPrefix('v1/api');
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
