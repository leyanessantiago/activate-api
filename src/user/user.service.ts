import { Injectable } from '@nestjs/common';
import { User, Prisma, Consumer } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ConsumerDTO } from './models/consumer.dto';
import { PublisherDTO } from './models/publisher.dto';
import { UserDTO } from './models/user.dto';
import { RelationshipStatus } from '../constants/user';

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

  async findMyPublishers(currentUser: string): Promise<UserDTO[]> {
    const consumer = await this.prismaService.consumer.findUnique({
      where: {
        userId: currentUser,
      },
      include: {
        following: {
          include: {
            user: {
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

    if (consumer === null) {
      return [];
    }

    return consumer.following.map((f) => f.user);
  }

  async findPublishersFollowedBy(
    userId: string,
    currentUser: string,
  ): Promise<PublisherDTO[]> {
    const consumer = await this.prismaService.consumer.findUnique({
      where: {
        userId,
      },
      select: {
        following: {
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
          },
        },
      },
    });

    if (consumer === null) {
      return [];
    }

    return consumer.following.map(({ user, followers }) => ({
      ...user,
      events: undefined,
      followers: undefined,
      followedByMe: followers.length > 0,
    }));
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
            relatives: {
              where: {
                userBId: currentUser,
                AND: [{ status: RelationshipStatus.ACCEPTED }],
              },
            },
            relatedTo: {
              where: {
                userAId: currentUser,
                AND: [{ status: RelationshipStatus.ACCEPTED }],
              },
            },
          },
        },
      },
    });

    if (!publisher) {
      return [];
    }

    return publisher.followers.map((follower) => {
      const { user, relatives, relatedTo } = follower;
      const isMyFriend = relatives?.length > 0 || relatedTo?.length > 0;

      return {
        ...user,
        myFriend: isMyFriend,
      } as ConsumerDTO;
    });
  }

  async findMyFriends(currentUser: string): Promise<UserDTO[]> {
    const friends = await this.prismaService.relationship.findMany({
      where: {
        OR: [{ userAId: currentUser }, { userBId: currentUser }],
        AND: [{ status: RelationshipStatus.ACCEPTED }],
      },
      select: {
        userAId: true,
        userBId: true,
        userA: {
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
          },
        },
        userB: {
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
          },
        },
      },
    });

    if (!friends) {
      return [];
    }

    return friends.map(
      (relation) =>
        (currentUser === relation.userAId && relation.userB.user) ||
        (currentUser === relation.userBId && relation.userA.user),
    );
  }

  async findFriendsOf(
    consumerId: string,
    currentUser: string,
  ): Promise<ConsumerDTO[]> {
    const friends = await this.prismaService.relationship.findMany({
      where: {
        OR: [
          { userAId: consumerId, AND: { userBId: { not: currentUser } } },
          { userBId: consumerId, AND: { userAId: { not: currentUser } } },
        ],
        AND: [{ status: RelationshipStatus.ACCEPTED }],
      },
      select: {
        userAId: true,
        userBId: true,
        userA: {
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
            relatives: {
              where: {
                userBId: currentUser,
                AND: [{ status: RelationshipStatus.ACCEPTED }],
              },
            },
            relatedTo: {
              where: {
                userAId: currentUser,
                AND: [{ status: RelationshipStatus.ACCEPTED }],
              },
            },
          },
        },
        userB: {
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
            relatives: {
              where: {
                userBId: currentUser,
                AND: [{ status: RelationshipStatus.ACCEPTED }],
              },
            },
            relatedTo: {
              where: {
                userAId: currentUser,
                AND: [{ status: RelationshipStatus.ACCEPTED }],
              },
            },
          },
        },
      },
    });

    if (!friends) {
      return [];
    }

    return friends.map((relation) => {
      const consumer =
        (consumerId === relation.userAId && relation.userB) ||
        (consumerId === relation.userBId && relation.userA);

      const { user, relatives, relatedTo } = consumer;
      const isMyFriend = relatives?.length > 0 || relatedTo?.length > 0;

      return {
        ...user,
        following: undefined,
        friends: undefined,
        myFriend: isMyFriend,
      };
    });
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
    const consumer = await this.prismaService.consumer.findUnique({
      where: {
        userId: id,
      },
      select: {
        userId: true,
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
            following: true,
          },
        },
      },
    });

    const friendsCount = await this.prismaService.relationship.count({
      where: {
        OR: [{ userAId: consumer.userId }, { userBId: consumer.userId }],
        AND: [{ status: RelationshipStatus.ACCEPTED }],
      },
    });

    const relationWithCurrentUser = await this.prismaService.relationship.count(
      {
        where: {
          OR: [
            { userAId: consumer.userId, AND: { userBId: currentUser } },
            { userBId: consumer.userId, AND: { userAId: currentUser } },
          ],
          AND: [{ status: RelationshipStatus.ACCEPTED }],
        },
      },
    );

    const {
      user,
      _count: { following },
    } = consumer;

    return {
      ...user,
      following,
      friends: friendsCount,
      myFriend: relationWithCurrentUser > 0,
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
