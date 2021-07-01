import { Controller, Get, Query } from '@nestjs/common';
import {
  FetchUpcomingEventsQueryParams,
  UpcomingEventService,
} from './upcoming_event.service';
import { CurrentUser } from '../core/jwt/current-user.decorator';
import { IUserInfo } from '../auth/models/iuser-info';
import { PagedResponse } from '../core/responses/paged-response';
import { UpcomingEventDto } from './dto/upcoming_event.dto';

@Controller('upcoming_events')
export class UpcomingEventController {
  constructor(private readonly upcomingEventService: UpcomingEventService) {}

  @Get()
  getCurrentUserUpcomingEvents(
    @CurrentUser() user: IUserInfo,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('date') date: string,
  ): Promise<PagedResponse<UpcomingEventDto>> {
    const queryParams: FetchUpcomingEventsQueryParams = {
      page: page || undefined,
      limit: limit || undefined,
      date,
    };
    return this.upcomingEventService.findCurrentUserUpcomingEvents(
      user.sub,
      queryParams,
    );
  }

  @Get('dates')
  getDatesOfCurrentUserUpcomingEvents(
    @CurrentUser() user: IUserInfo,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<PagedResponse<Date>> {
    const queryParams: FetchUpcomingEventsQueryParams = {
      page: page || undefined,
      limit: limit || undefined,
    };

    return this.upcomingEventService.findDatesOfCurrentUserEvents(
      user.sub,
      queryParams,
    );
  }
}
