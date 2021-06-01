import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { UserInterestsModule } from './user-interests/user-interests.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './core/jwt/jwt.guard';
import { JwtStrategy } from './core/jwt/jwt.startegy';
import { EventModule } from './event/event.module';
// import { RateLimiterModule, RateLimiterInterceptor } from 'nestjs-rate-limiter';
// import RateLimiterConfiguration from './core/constants/rate-limiter-configuration';

@Module({
  imports: [
    UserModule,
    AuthModule,
    EventModule,
    CategoryModule,
    UserInterestsModule,
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
    JwtStrategy,
    JwtAuthGuard,
  ],
})
export class AppModule {}
