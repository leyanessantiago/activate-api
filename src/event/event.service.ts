import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Event } from '.prisma/client';
import { ApiException } from '../core/exceptions/api-exception';

@Injectable()
export class EventService {
  constructor(private readonly prismaService: PrismaService) {}

  public async findEventsByPublisher(id: string): Promise<Event[]> {
    return await this.prismaService.event.findMany({
      where: {
        authorId: id,
      },
      include: {
        category: true,
      },
    });
  }

  async followEvent(user: string, event: string): Promise<any> {
    const relation = await this.prismaService.eventFollower.findUnique({
      where: {
        consumerId_eventId: {
          consumerId: user,
          eventId: event,
        },
      },
    });

    if (relation) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The relation could not be created.',
      );
    }

    return this.prismaService.eventFollower.create({
      data: {
        consumerId: user,
        eventId: event,
      },
    });
  }

  async unfollowEvent(user: string, event: string): Promise<any> {
    const relation = await this.prismaService.eventFollower.findUnique({
      where: {
        consumerId_eventId: {
          consumerId: user,
          eventId: event,
        },
      },
    });

    if (!relation) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The relation could not be removed',
      );
    }

    return this.prismaService.eventFollower.delete({
      where: {
        consumerId_eventId: {
          consumerId: user,
          eventId: event,
        },
      },
    });
  }
}
