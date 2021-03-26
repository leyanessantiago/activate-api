import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SignUpValidationPipe } from './validators/sign-up-validator';
import { JwtModule } from '@nestjs/jwt';
import { LoginValidator } from './validators/login-validator';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtStrategy } from './jwt/jwt.startegy';
import { JwtAuthGuard } from './jwt/jwt.guard';

@Module({
  imports: [forwardRef(() => UserModule),
            PrismaModule,
            JwtModule.register({
              secret: process.env['JWT_SECRET'],
              signOptions: { expiresIn: '8640s' },
            })],
  controllers: [AuthController],
  providers: [AuthService,
              UserService,
              PrismaService,
              SignUpValidationPipe,
              LoginValidator,
              JwtStrategy,
              JwtAuthGuard],
  exports: [JwtModule,
            AuthService,
            JwtStrategy, 
            JwtAuthGuard]
})
export class AuthModule {}
