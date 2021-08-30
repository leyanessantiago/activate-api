import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { MailModule } from '../mail/mail.module';
import { GoogleStrategy } from '../core/social_auth/google.startegy';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    MailModule,
    MulterModule.register({
      dest: './images/avatars',
    }),
    JwtModule.register({
      secret: process.env['JWT_SECRET'],
      signOptions: { expiresIn: '8640s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, PrismaService, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
