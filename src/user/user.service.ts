import { Injectable } from '@nestjs/common';
import { User, Prisma, Follower, Publisher } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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

  async findFriends(id: string, extended = false): Promise<Follower[]> {
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
      return new Array<Follower>();
    }

    return follower.friends;
  }

  async findPublishers(id: string, extended = false): Promise<Publisher[]> {
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
      return new Array<Publisher>();
    }

    return follower.following;
  }

  async findById(id: string): Promise<User> {
    return await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
    });
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
