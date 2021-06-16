import { Module } from '@nestjs/common';
import { UpcomingService } from './upcoming.service';
import { UpcomingController } from './upcoming.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  providers: [UpcomingService],
  controllers: [UpcomingController],
})
export class UpcomingModule {}
