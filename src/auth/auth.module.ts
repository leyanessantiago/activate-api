import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SignUpValidationPipe } from './validators/sign-up-validator';
import { JwtModule } from '@nestjs/jwt';
import { LoginValidator } from './validators/login-validator';
import { PrismaService } from '../prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    MulterModule.register({
      dest: './images/avatars',
    }),
    JwtModule.register({
      secret: process.env['JWT_SECRET'],
      signOptions: { expiresIn: '8640s' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    PrismaService,
    SignUpValidationPipe,
    LoginValidator,
  ],
  exports: [AuthService],
})
export class AuthModule {}
