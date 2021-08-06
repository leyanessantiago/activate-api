import { HttpStatus, Injectable } from '@nestjs/common';
import { endOfDay, startOfDay } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import { Event } from '.prisma/client';
import { ApiException } from '../core/exceptions/api-exception';
import { RelationshipStatus } from '../constants/user';
import buildRelevanceMap from './utils/build-relevance-map';
import compareEvents from './utils/compare-events';
import { QueryParams } from '../constants/queries';
import { EventDTO } from './models/event';
import { PagedResponse } from '../core/responses/paged-response';
import buildImageUrl from '../helpers/build-image-url';
import buildAvatarUrl from '../helpers/build-avatar-url';
import findIfImGoing from './utils/find-if-im-going';
import pickTopFriends from './utils/pick-top-friends';

export interface UpcomingEventsQueryParams extends QueryParams {
  date?: string;
}

@Injectable()
export class EventService {
  constructor(private readonly prismaService: PrismaService) {}

  async findMyUpcomingEvents(
    currentUserId: string,
    queryParams: UpcomingEventsQueryParams,
  ): Promise<PagedResponse<EventDTO>> {
    const { limit, page, date } = queryParams;

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
            gte: startOfDay(new Date(date)),
            lte: endOfDay(new Date(date)),
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
        image: true,
        address: true,
        description: true,
        author: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
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

    const results = upcomingEvents.map((event) => {
      const { author, image, followers, _count, ...rest } = event;
      const friends = followers.map((follower) => ({
        id: follower.consumer.user.id,
        avatar: buildAvatarUrl(follower.consumer.user.avatar),
      }));

      return {
        ...rest,
        image: buildImageUrl(`events/image/${image}`),
        author: {
          ...author.user,
          avatar: buildAvatarUrl(author.user.avatar),
        },
        friends,
        followersCount: _count.followers,
        going: true,
      };
    });

    return {
      results,
      count,
      page,
    };
  }

  async findDatesOfMyUpcomingEvents(
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

  async findEventsToRecommendMe(
    user: string,
    startDate?: string,
  ): Promise<EventDTO[]> {
    const interests = await this.prismaService.userInterests.findMany({
      where: {
        userId: user,
      },
      orderBy: {
        relevance: 'desc',
      },
    });

    const categories = interests.map((interest) => interest.categoryId);

    const dateFilter = startDate
      ? { gt: new Date(startDate) }
      : { gte: startOfDay(new Date()) };

    const events = await this.prismaService.event.findMany({
      where: {
        categoryId: { in: categories },
        date: dateFilter,
      },
      select: {
        id: true,
        name: true,
        date: true,
        image: true,
        address: true,
        description: true,
        categoryId: true,
        author: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        followers: {
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
                        userBId: user,
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
                        userAId: user,
                      },
                    },
                  },
                },
                {
                  userId: user,
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

    const relevanceMap = buildRelevanceMap(interests);
    events.sort((a, b) => compareEvents(a, b, relevanceMap));

    return events.map((event) => {
      const { author, image, followers, _count, ...rest } = event;
      const amIGoing = findIfImGoing(followers, user);
      const friends = pickTopFriends(followers, user).map((follower) => ({
        id: follower.consumer.user.id,
        avatar: buildAvatarUrl(follower.consumer.user.avatar),
      }));

      return {
        ...rest,
        image: buildImageUrl(`events/image/${image}`),
        author: {
          ...author.user,
          avatar: buildAvatarUrl(author.user.avatar),
        },
        friends,
        followersCount: amIGoing ? _count.followers - 1 : _count.followers,
        going: amIGoing,
      };
    });
  }

  async findEventsByPublisher(id: string): Promise<Event[]> {
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
