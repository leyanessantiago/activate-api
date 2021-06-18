import { Injectable } from '@nestjs/common';
import { User, Prisma, Consumer } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ConsumerDTO } from './models/consumer.dto';
import { PublisherDTO } from './models/publisher.dto';
import { UserDTO } from './models/user.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findByUserName(userName: string): Promise<User | undefined> {
    return this.prismaService.user.findUnique({
      where: {
        userName: userName,
      },
    });
  }

  async findPublishersFollowedBy(
    userId: string,
    extended = false,
  ): Promise<User[]> {
    const follower = await this.prismaService.consumer.findUnique({
      where: {
        userId,
      },
      include: {
        following: {
          include: {
            user: extended || {
              select: {
                id: true,
                name: true,
                lastName: true,
                avatar: true,
                userName: true,
              },
            },
          },
        },
      },
    });

    if (follower === null) {
      return [];
    }

    return follower.following.map((f) => f.user);
  }

  async findMyFollowers(id: string): Promise<UserDTO[]> {
    const publisher = await this.prismaService.publisher.findUnique({
      where: {
        userId: id,
      },
      select: {
        followers: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                lastName: true,
                userName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!publisher) {
      return [];
    }

    return publisher.followers.map((f) => f.user);
  }

  async findFollowersOf(
    id: string,
    currentUser: string,
  ): Promise<ConsumerDTO[]> {
    const publisher = await this.prismaService.publisher.findUnique({
      where: {
        userId: id,
      },
      select: {
        followers: {
          where: {
            userId: {
              not: currentUser,
            },
          },
          select: {
            user: {
              select: {
                id: true,
                name: true,
                lastName: true,
                avatar: true,
                userName: true,
              },
            },
            friends: {
              where: {
                userId: currentUser,
              },
            },
          },
        },
      },
    });

    if (!publisher) {
      return [];
    }

    console.log(publisher.followers.map((f) => f.friends));

    return publisher.followers.map((follower) => {
      const { user, friends } = follower;

      return {
        ...user,
        myFriend: friends.length > 0,
      } as ConsumerDTO;
    });
  }

  async findFriendsOf(id: string, extended = false): Promise<User[]> {
    const follower = await this.prismaService.consumer.findUnique({
      where: {
        userId: id,
      },
      include: {
        friends: {
          include: {
            user: extended || {
              select: {
                id: true,
                name: true,
                lastName: true,
                avatar: true,
                userName: true,
              },
            },
          },
        },
      },
    });

    if (follower === null) {
      return [];
    }

    return follower.friends.map((f) => f.user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        avatar: true,
        userName: true,
      },
    });

    return user as User;
  }

  async findPublisherById(
    id: string,
    currentUser: string,
  ): Promise<PublisherDTO> {
    const publisher = await this.prismaService.publisher.findUnique({
      where: {
        userId: id,
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            avatar: true,
            userName: true,
          },
        },
        followers: {
          where: {
            userId: currentUser,
          },
        },
        _count: {
          select: {
            events: true,
            followers: true,
          },
        },
      },
    });

    const {
      user,
      followers,
      _count: { events, followers: followersCount },
    } = publisher;

    return {
      ...user,
      events,
      followers: followersCount,
      followedByMe: followers.length > 0,
    };
  }

  async findConsumerById(
    id: string,
    currentUser: string,
  ): Promise<ConsumerDTO> {
    const follower = await this.prismaService.consumer.findUnique({
      where: {
        userId: id,
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            avatar: true,
            userName: true,
          },
        },
        friends: {
          where: {
            userId: currentUser,
          },
        },
        _count: {
          select: {
            following: true,
            friends: true,
          },
        },
      },
    });

    const {
      user,
      friends,
      _count: { friends: friendsCount, following },
    } = follower;

    return {
      ...user,
      friends: friendsCount,
      following,
      myFriend: friends.length > 0,
    } as ConsumerDTO;
  }

  async follow(userId: string, publisherId: string) {
    return this.prismaService.consumer.update({
      where: {
        userId,
      },
      data: {
        following: {
          connect: {
            userId: publisherId,
          },
        },
      },
    });
  }

  async create(userCreate: Prisma.UserCreateInput): Promise<User> {
    return await this.prismaService.user.create({
      data: userCreate,
    });
  }

  async createConsumer(
    follower: Prisma.ConsumerCreateInput,
  ): Promise<(Consumer & { user: User }) | null> {
    return await this.prismaService.consumer.create({
      data: follower,
      include: {
        user: true,
      },
    });
  }

  async update(id: string, user: Prisma.UserUpdateInput): Promise<User> {
    return await this.prismaService.user.update({
      data: user,
      where: {
        id: id,
      },
    });
  }
}
