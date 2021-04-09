import { Controller, Get, Param } from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from '.prisma/client';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('publishedBy/:id')
  async getEventsByPublisherId(@Param('id') id: string): Promise<Event[]> {
    return await this.eventService.findEventsByPublisherId(id);
  }
}
