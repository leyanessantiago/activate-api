import { Injectable } from '@nestjs/common';
import { User, Prisma, Follower } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PublisherDTO } from './models/publisher.dto';

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

  async findFriendsOf(id: string, extended = false): Promise<User[]> {
    const follower = await this.prismaService.follower.findUnique({
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

  async findPublishersOf(id: string, extended = false): Promise<User[]> {
    const follower = await this.prismaService.follower.findUnique({
      where: {
        userId: id,
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

  async findFollowersOf(id: string, extended = false): Promise<User[]> {
    const follower = await this.prismaService.publisher.findUnique({
      where: {
        userId: id,
      },
      include: {
        followedBy: {
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

    return follower.followedBy.map((f) => f.user);
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

  async findPublisherById(id: string): Promise<PublisherDTO> {
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
        _count: {
          select: {
            events: true,
            followedBy: true,
          },
        },
      },
    });

    const {
      user,
      _count: { events, followedBy },
    } = publisher;

    return {
      ...user,
      events,
      followers: followedBy,
    } as PublisherDTO;
  }

  async create(userCreate: Prisma.UserCreateInput): Promise<User | null> {
    return await this.prismaService.user.create({
      data: userCreate,
    });
  }

  async createFollower(
    follower: Prisma.FollowerCreateInput,
  ): Promise<(Follower & { user: User }) | null> {
    return await this.prismaService.follower.create({
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
