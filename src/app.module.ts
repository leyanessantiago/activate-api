import { Module, RequestMethod } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino/dist';
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
// import RateLimiterConfiguration from './core/constants/rate-limiter-configuration';
import { UpcomingEventModule } from './upcoming_event/upcoming_event.module';

@Module({
  imports: [
    UserModule,
    UpcomingEventModule,
    AuthModule,
    EventModule,
    CategoryModule,
    InterestsModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        prettyPrint: process.env.NODE_ENV !== 'production',
      },
      exclude: [{ method: RequestMethod.ALL, path: 'info' }],
    }),
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
