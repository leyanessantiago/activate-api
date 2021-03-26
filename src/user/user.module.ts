import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule,
           forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService, PrismaService]
})
export class UserModule {}
