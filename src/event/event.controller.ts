import { Controller, Get, Param, Res } from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from '.prisma/client';
import { Public } from '../core/jwt/public.decorator';
import { CurrentUser } from '../core/jwt/current-user.decorator';
import { IUserInfo } from '../auth/models/iuser-info';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

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
