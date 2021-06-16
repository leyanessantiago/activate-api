import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpcomingEventsDto } from './upcoming.interface';
import { UserService } from '../user/user.service';
import { Follower } from '@prisma/client';

const emptyDto: UpcomingEventsDto = {
  name: '',
  date: null,
  address: '',
  category: '',
  author: {
    username: '',
    name: '',
    eventCount: 0,
    followersCount: 0,
  },
  attendance: 0,
  friends: null,
};

@Injectable()
export class UpcomingService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllUpcomingEvents(userId: string, page: number, items: number) {
    const upcoming: UpcomingEventsDto[] = [];
    const friends: Follower[] = await this.selectFriends(userId);

    const results = await this.prismaService.event.findMany({
      skip: --page * items,
      take: items,
      where: {
        date: {
          gt: new Date(),
        },
      },
      include: {
        followers: true,
        category: {
          select: {
            name: true,
          },
        },
        author: {
          include: {
            user: {
              include: {
                publisher: {
                  include: {
                    events: true,
                    followedBy: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    for (let i = 0; i < results.length; i++) {
      upcoming.push(this.constructDto(results[i], friends));
    }

    return upcoming;
  }

  async findUpcomingEventsByDate(
    userId: string,
    page: number,
    items: number,
    date: Date,
  ) {
    const upcoming: UpcomingEventsDto[] = [];
    const friends: Follower[] = await this.selectFriends(userId);

    const results = await this.prismaService.event.findMany({
      skip: --page * items,
      take: items,
      where: {
        date: date,
      },
      include: {
        followers: true,
        category: {
          select: {
            name: true,
          },
        },
        author: {
          include: {
            user: {
              include: {
                publisher: {
                  include: {
                    events: true,
                    followedBy: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    for (let i = 0; i < results.length; i++) {
      upcoming.push(this.constructDto(results[i], friends));
    }

    return upcoming;
  }

  async findDateOfUserEvents(userId: string, page: number, items: number) {
    const upcoming: UpcomingEventsDto[] = [];
    const friends: Follower[] = await this.selectFriends(userId);

    const results = await this.prismaService.event.findMany({
      skip: --page * items,
      take: items,
      where: {
        followers: {
          some: {
            user: {
              id: userId,
            },
          },
        },
      },
      select: {
        date: true,
      },
    });

    for (let i = 0; i < results.length; i++) {
      upcoming.push(this.constructDto(results[i], friends));
    }

    return upcoming;
  }

  constructDto(event: any, friends): UpcomingEventsDto {
    const converted: UpcomingEventsDto = emptyDto;

    converted.name = event.name;
    converted.address = event.address;
    converted.date = event.date;
    converted.image = event.image;
    converted.description = event.description;
    converted.attendance = event.followers.length;
    converted.friends = friends;
    converted.author.name = event.author.user.name;
    converted.author.username = event.author.user.userName;
    converted.author.eventCount = event.author.user.publisher.events.length;
    converted.author.followersCount = event.followers.length;
    converted.category = event.category.name;

    return converted;
  }

  async selectFriends(UserId: string) {
    const friendsConsult = await this.prismaService.follower.findUnique({
      where: {
        userId: UserId,
      },
      include: {
        friends: {
          take: 4,
          include: {
            user: {
              select: {
                name: true,
                lastName: true,
                userName: true,
              },
            },
          },
        },
      },
    });

    return friendsConsult[0].friends;
  }
}
