import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './core/jwt/jwt.guard';
import { JwtStrategy } from './core/jwt/jwt.startegy';
import { EventModule } from './event/event.module';

@Module({
  imports: [UserModule, AuthModule, EventModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtStrategy,
    JwtAuthGuard,
  ],
})
export class AppModule {}
