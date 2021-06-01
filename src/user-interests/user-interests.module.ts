import { Module } from '@nestjs/common';
import { UserInterestsService } from './user-interests.service';
import { UserInterestsController } from './user-interests.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserInterestsController],
  providers: [UserInterestsService, PrismaService],
})
export class UserInterestsModule {}
