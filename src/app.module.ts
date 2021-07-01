import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { InterestsModule } from './interests/interests.module';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtAuthGuard } from './core/jwt/jwt.guard';
import { JwtStrategy } from './core/jwt/jwt.startegy';
import { EventModule } from './event/event.module';
import { ValidationPipe } from './core/validators/validation.pipe';
// import { RateLimiterModule, RateLimiterInterceptor } from 'nestjs-rate-limiter';
import { ActivityModule } from './activity/activity.module';
// import RateLimiterConfiguration from './core/constants/rate-limiter-configuration';

@Module({
  imports: [
    UserModule,
    AuthModule,
    EventModule,
    CategoryModule,
    InterestsModule,
    ActivityModule,
    // RateLimiterModule.register(RateLimiterConfiguration),
  ],
  controllers: [],
  providers: [
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: RateLimiterInterceptor,
    // },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    JwtStrategy,
    JwtAuthGuard,
  ],
})
export class AppModule {}
