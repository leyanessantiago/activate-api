import { Controller, Get, Param, Res, Query } from '@nestjs/common';
import { EventService, UpcomingEventsQueryParams } from './event.service';
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
  ): Promise<PagedResponse<EventDTO>> {
    const queryParams: UpcomingEventsQueryParams = {
      page,
      limit,
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
  async getEventsByPublisher(
    @Param('id') publisher: string,
    @CurrentUser() user: IUserInfo,
  ): Promise<EventDTO[]> {
    return await this.eventService.findEventsPublishedBy(publisher, user.sub);
  }

  @Get('attended-by/:id')
  async getEventsAttendedBy(
    @Param('id') consumer: string,
    @CurrentUser() user: IUserInfo,
  ): Promise<EventDTO[]> {
    return await this.eventService.findEventsAttendedBy(consumer, user.sub);
  }

  @Get('search/:term')
  async searchEvents(
    @Param('term') term: string,
    @CurrentUser() user: IUserInfo,
  ): Promise<EventDTO[]> {
    return await this.eventService.searchEvents(term.toLowerCase(), user.sub);
  }

  @Get(':id/details')
  async getById(
    @Param('id') eventId: string,
    @CurrentUser() user: IUserInfo,
  ): Promise<EventDTO> {
    return await this.eventService.getById(eventId, user.sub);
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
