import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Event } from '.prisma/client';

@Injectable()
export class EventService {
  constructor(private readonly prismaService: PrismaService) {}

  public async findEventsByPublisherId(id: string): Promise<Event[]> {
    return await this.prismaService.event.findMany({
      where: {
        authorId: id,
      },
      include: {
        category: true,
      },
    });
  }
}
