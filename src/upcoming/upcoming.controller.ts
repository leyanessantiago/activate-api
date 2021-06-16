import { Controller, Get, Param, Query } from '@nestjs/common';
import { UpcomingService } from './upcoming.service';
import { CurrentUser } from '../core/jwt/current-user.decorator';
import { UserInfo } from '../auth/models/user-info';

@Controller('upcoming')
export class UpcomingController {
  constructor(private readonly upcomingService: UpcomingService) {}

  @Get('all')
  findAllUpcomingEvents(
    @CurrentUser() user: UserInfo,
    @Query('page') page: number,
    @Query('items') items: number,
  ) {
    return this.upcomingService.findAllUpcomingEvents(user.sub, page, items);
  }

  @Get('on/:date')
  findUpcomingEventsByDate(
    @CurrentUser() user: UserInfo,
    @Param('date') date: Date,
    @Query('page') page: number,
    @Query('items') items: number,
  ) {
    return this.upcomingService.findUpcomingEventsByDate(
      user.sub,
      page,
      items,
      date,
    );
  }

  @Get('dates')
  findDateOfUserEvents(
    @CurrentUser() user: UserInfo,
    @Query('page') page: number,
    @Query('items') items: number,
  ) {
    return this.upcomingService.findDateOfUserEvents(user.sub, page, items);
  }
}
