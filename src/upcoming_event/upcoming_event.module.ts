import { Module } from '@nestjs/common';
import { UpcomingEventService } from './upcoming_event.service';
import { UpcomingEventController } from './upcoming_event.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  providers: [UpcomingEventService],
  controllers: [UpcomingEventController],
})
export class UpcomingEventModule {}
