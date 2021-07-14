import { Controller, Get, Param, Res, Query } from '@nestjs/common';
import { EventService, UpcomingEventsQueryParams } from './event.service';
import { Event } from '.prisma/client';
import { Public } from '../core/jwt/public.decorator';
import { CurrentUser } from '../core/jwt/current-user.decorator';
import { IUserInfo } from '../auth/models/iuser-info';
import { EventDTO } from './models/event';
import { PagedResponse } from '../core/responses/paged-response';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('upcoming')
  getCurrentUserUpcomingEvents(
    @CurrentUser() user: IUserInfo,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('date') date: string,
  ): Promise<PagedResponse<EventDTO>> {
    const queryParams: UpcomingEventsQueryParams = {
      page,
      limit,
      date,
    };
    return this.eventService.findMyUpcomingEvents(user.sub, queryParams);
  }

  @Get('upcoming/dates')
  getDatesOfCurrentUserUpcomingEvents(
    @CurrentUser() user: IUserInfo,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<PagedResponse<Date>> {
    const queryParams: UpcomingEventsQueryParams = {
      page: page || undefined,
      limit: limit || undefined,
    };

    return this.eventService.findDatesOfMyUpcomingEvents(user.sub, queryParams);
  }

  @Get('discover')
  async discoverNewEvents(
    @CurrentUser() user: IUserInfo,
    @Query('date') date: string,
  ): Promise<EventDTO[]> {
    return this.eventService.findEventsToRecommendMe(user.sub, date);
  }

  @Get('publishedBy/:id')
  async getEventsByPublisher(@Param('id') id: string): Promise<Event[]> {
    return await this.eventService.findEventsByPublisher(id);
  }

  @Get(':id/follow')
  async followEvent(
    @CurrentUser() user: IUserInfo,
    @Param('id') event: string,
  ) {
    return this.eventService.followEvent(user.sub, event);
  }

  @Get(':id/unfollow')
  async unfollowEvent(
    @CurrentUser() user: IUserInfo,
    @Param('id') event: string,
  ) {
    return this.eventService.unfollowEvent(user.sub, event);
  }

  @Public()
  @Get('image/:img')
  getAvatar(@Param('img') eventImg, @Res() res) {
    return res.sendFile(eventImg, { root: './images/events' });
  }
}
