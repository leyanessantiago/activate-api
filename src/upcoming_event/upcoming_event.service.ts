import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RelationshipStatus } from '../constants/user';
import { UpcomingEventDto } from './dto/upcoming_event.dto';
import { PagedResponse } from '../core/responses/paged-response';
import { QueryParams } from '../constants/queries';

export interface UpcomingEventsQueryParams extends QueryParams {
  date?: string;
}

@Injectable()
export class UpcomingEventService {
  constructor(private readonly prismaService: PrismaService) {}

  async findCurrentUserUpcomingEvents(
    currentUserId: string,
    queryParams: UpcomingEventsQueryParams,
  ): Promise<PagedResponse<UpcomingEventDto>> {
    const { limit, page, date } = queryParams;
    const dayBegin = date ? new Date(`${date}T00:00:00`) : undefined;
    const dayEnd = date ? new Date(`${date}T23:59:59`) : undefined;

    const where = {
      followers: { some: { consumerId: currentUserId } },
      AND: [
        {
          date: {
            gte: new Date(),
          },
        },
        {
          date: {
            gte: dayBegin,
            lte: dayEnd,
          },
        },
      ],
    };

    const upcomingEvents = await this.prismaService.event.findMany({
      skip: page ? (limit || 0) * (page - 1) : 0,
      take: limit || undefined,
      orderBy: { date: 'asc' },
      where,
      select: {
        id: true,
        name: true,
        date: true,
        description: true,
        author: {
          select: {
            user: {
              select: {
                id: true,
                avatar: true,
              },
            },
          },
        },
        followers: {
          take: 4,
          where: {
            consumer: {
              OR: [
                {
                  relatives: {
                    some: {
                      OR: [
                        { status: RelationshipStatus.ACCEPTED },
                        { status: RelationshipStatus.MUTED },
                      ],
                      AND: {
                        userBId: currentUserId,
                      },
                    },
                  },
                },
                {
                  relatedTo: {
                    some: {
                      OR: [
                        { status: RelationshipStatus.ACCEPTED },
                        { status: RelationshipStatus.MUTED },
                      ],
                      AND: {
                        userAId: currentUserId,
                      },
                    },
                  },
                },
              ],
            },
          },
          select: {
            consumer: {
              select: {
                user: {
                  select: {
                    id: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    const count = await this.prismaService.event.count({ where });

    const results = upcomingEvents.map((upcomingEvent) => {
      const { author, followers, _count, ...rest } = upcomingEvent;
      const relativesFollowers = followers.map((follower) => ({
        id: follower.consumer.user.id,
        avatar: follower.consumer.user.avatar,
      }));

      return {
        ...rest,
        author: {
          id: author.user.id,
          avatar: author.user.avatar,
        },
        relativesFollowers,
        followersCount: _count.followers,
      };
    });

    return {
      results,
      count,
      page,
    };
  }

  async findDatesOfCurrentUserEvents(
    currentUserId: string,
    queryParams: UpcomingEventsQueryParams,
  ): Promise<PagedResponse<Date>> {
    const { limit, page } = queryParams;

    const where = {
      followers: { some: { consumerId: currentUserId } },
      date: {
        gte: new Date(),
      },
    };

    const upcomingEventsDates = await this.prismaService.event.findMany({
      skip: page ? (limit || 0) * (page - 1) : 0,
      take: limit || undefined,
      orderBy: { date: 'asc' },
      where,
      select: {
        date: true,
      },
    });

    const count = await this.prismaService.event.count({ where });

    const results = upcomingEventsDates.map(
      (upcomingEventsDate) => upcomingEventsDate.date,
    );

    return {
      results,
      count,
      page,
    };
  }
}
