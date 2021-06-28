import { HttpStatus, Injectable } from '@nestjs/common';
import { User, Prisma, Relationship } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ConsumerDTO } from './models/consumer.dto';
import { PublisherDTO } from './models/publisher.dto';
import { UserDTO } from './models/user.dto';
import { FollowerStatus, RelationshipStatus } from '../constants/user';
import { ActivityType } from '../constants/activities';
import { ApiException } from '../core/exceptions/api-exception';
import { getStatus } from './utils';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findMyStats(userId: string) {
    const friendsCount = await this.prismaService.relationship.count({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        AND: [{ status: RelationshipStatus.ACCEPTED }],
      },
    });

    const followingCount = await this.prismaService.follower.count({
      where: {
        consumerId: userId,
      },
    });

    return { friends: friendsCount, following: followingCount };
  }

  async findMyPublishers(currentUser: string): Promise<PublisherDTO[]> {
    const results = await this.prismaService.follower.findMany({
      where: {
        consumerId: currentUser,
        AND: {
          status: { not: FollowerStatus.BLOCKED },
        },
      },
      orderBy: {
        createdOn: 'asc',
      },
      select: {
        status: true,
        publisher: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                userName: true,
              },
            },
          },
        },
      },
    });

    return results.map((entry) => {
      const {
        publisher: { user },
        status,
      } = entry;

      return {
        ...user,
        followers: undefined,
        events: undefined,
        followerStatus: status,
      } as PublisherDTO;
    });
  }

  async findMyFollowers(id: string): Promise<UserDTO[]> {
    const followers = await this.prismaService.follower.findMany({
      where: {
        publisherId: id,
      },
      orderBy: {
        createdOn: 'asc',
      },
      select: {
        consumer: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                userName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return followers.map((f) => f.consumer.user);
  }

  async findMyFriends(currentUser: string): Promise<ConsumerDTO[]> {
    const friends = await this.prismaService.relationship.findMany({
      where: {
        OR: [{ userAId: currentUser }, { userBId: currentUser }],
        AND: {
          OR: [
            { status: RelationshipStatus.ACCEPTED },
            { status: RelationshipStatus.MUTED },
          ],
        },
      },
      orderBy: {
        createdOn: 'asc',
      },
      select: {
        status: true,
        userAId: true,
        userBId: true,
        userA: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
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

    return friends.map((relation) => {
      const user =
        (currentUser === relation.userAId && relation.userB.user) ||
        (currentUser === relation.userBId && relation.userA.user);

      return {
        ...user,
        following: undefined,
        friends: undefined,
        relationStatus: relation.status,
      };
    });
  }

  async findMyPendingRequests(currentUser: string): Promise<ConsumerDTO[]> {
    const friends = await this.prismaService.relationship.findMany({
      where: {
        userBId: currentUser,
        AND: {
          status: RelationshipStatus.PENDING,
        },
      },
      orderBy: {
        createdOn: 'asc',
      },
      select: {
        status: true,
        userA: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
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

    return friends.map((relation) => {
      const user = relation.userA.user;

      return {
        ...user,
        following: undefined,
        friends: undefined,
        relationStatus: relation.status,
      };
    });
  }

  async findUsersIBlocked(currentUser: string): Promise<UserDTO[]> {
    const results = await this.prismaService.relationship.findMany({
      where: {
        OR: [{ userAId: currentUser }, { userBId: currentUser }],
        AND: {
          status: RelationshipStatus.BLOCKED,
          updatedBy: currentUser,
        },
      },
      orderBy: {
        createdOn: 'asc',
      },
      select: {
        userA: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
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
                avatar: true,
                userName: true,
              },
            },
          },
        },
      },
    });

    return results.map((relation) => {
      const { userA, userB } = relation;
      const user = (userA && userA.user) || (userB && userB.user);
      return user;
    });
  }

  async findUsersWhoBlockedMe(currentUser: string): Promise<UserDTO[]> {
    const results = await this.prismaService.relationship.findMany({
      where: {
        OR: [{ userAId: currentUser }, { userBId: currentUser }],
        AND: {
          status: RelationshipStatus.BLOCKED,
          updatedBy: { not: currentUser },
        },
      },
      orderBy: {
        createdOn: 'asc',
      },
      select: {
        userA: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
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
                avatar: true,
                userName: true,
              },
            },
          },
        },
      },
    });

    return results.map((relation) => {
      const { userA, userB } = relation;
      const user = (userA && userA.user) || (userB && userB.user);
      return user;
    });
  }

  async findMyUsersToAvoid(currentUser: string): Promise<UserDTO[]> {
    const results = await this.prismaService.relationship.findMany({
      where: {
        OR: [{ userAId: currentUser }, { userBId: currentUser }],
        AND: {
          status: RelationshipStatus.BLOCKED,
        },
      },
      orderBy: {
        createdOn: 'asc',
      },
      select: {
        userA: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
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
                avatar: true,
                userName: true,
              },
            },
          },
        },
      },
    });

    return results.map((relation) => {
      const { userA, userB } = relation;
      const user = (userA && userA.user) || (userB && userB.user);
      return user;
    });
  }

  async findPublishersIBlocked(currentUser: string): Promise<UserDTO[]> {
    const results = await this.prismaService.follower.findMany({
      where: {
        consumerId: currentUser,
        AND: {
          status: FollowerStatus.BLOCKED,
          updatedBy: currentUser,
        },
      },
      orderBy: {
        createdOn: 'asc',
      },
      select: {
        publisher: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                userName: true,
              },
            },
          },
        },
      },
    });

    return results.map((relation) => relation.publisher.user);
  }

  async findPublishersWhoBlockedMe(currentUser: string): Promise<UserDTO[]> {
    const results = await this.prismaService.follower.findMany({
      where: {
        consumerId: currentUser,
        AND: {
          status: RelationshipStatus.BLOCKED,
          updatedBy: { not: currentUser },
        },
      },
      orderBy: {
        createdOn: 'asc',
      },
      select: {
        publisher: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                userName: true,
              },
            },
          },
        },
      },
    });

    return results.map((relation) => relation.publisher.user);
  }

  async findMyPublishersToAvoid(currentUser: string): Promise<UserDTO[]> {
    const results = await this.prismaService.follower.findMany({
      where: {
        consumerId: currentUser,
        AND: {
          status: RelationshipStatus.BLOCKED,
        },
      },
      orderBy: {
        createdOn: 'asc',
      },
      select: {
        publisher: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                userName: true,
              },
            },
          },
        },
      },
    });

    return results.map((relation) => relation.publisher.user);
  }

  async findPublishersFollowedBy(
    userId: string,
    currentUser: string,
  ): Promise<PublisherDTO[]> {
    const publishersToAvoid = await this.findMyPublishersToAvoid(currentUser);
    const ids = publishersToAvoid.map((p) => p.id);

    const following = await this.prismaService.follower.findMany({
      where: {
        consumerId: userId,
        publisherId: { notIn: ids },
      },
      select: {
        publisher: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                userName: true,
              },
            },
            followers: {
              where: {
                consumerId: currentUser,
              },
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    return following.map(({ publisher: { user, followers } }) => ({
      ...user,
      events: undefined,
      followers: undefined,
      followerStatus:
        followers && followers.length > 0
          ? followers[0].status
          : FollowerStatus.UNRELATED,
    }));
  }

  async findFriendsOf(
    consumerId: string,
    currentUser: string,
  ): Promise<ConsumerDTO[]> {
    const usersToAvoid = await this.findMyUsersToAvoid(currentUser);
    const ids = usersToAvoid.map((user) => user.id);

    const friends = await this.prismaService.relationship.findMany({
      where: {
        OR: [
          {
            userAId: consumerId,
            AND: {
              userAId: { notIn: ids },
              userBId: { not: currentUser },
            },
          },
          {
            userBId: consumerId,
            AND: {
              userBId: { notIn: ids },
              userAId: { not: currentUser },
            },
          },
        ],
        AND: {
          OR: [
            { status: RelationshipStatus.ACCEPTED },
            { status: RelationshipStatus.MUTED },
          ],
        },
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
                avatar: true,
                userName: true,
              },
            },
            relatives: {
              where: {
                userBId: currentUser,
              },
              select: {
                status: true,
              },
            },
            relatedTo: {
              where: {
                userAId: currentUser,
              },
              select: {
                status: true,
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
                avatar: true,
                userName: true,
              },
            },
            relatives: {
              where: {
                userBId: currentUser,
              },
              select: {
                status: true,
                updatedBy: true,
              },
            },
            relatedTo: {
              where: {
                userAId: currentUser,
              },
              select: {
                status: true,
                updatedBy: true,
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
      const userRelation =
        (relatives.length > 0 && relatives[0]) ||
        (relatedTo.length > 0 && relatedTo[0]);
      const status = getStatus(userRelation as Relationship, currentUser);

      return {
        ...user,
        following: undefined,
        friends: undefined,
        relationStatus: status,
      };
    });
  }

  async findFollowersOf(
    currentUser: string,
    publisher: string,
  ): Promise<ConsumerDTO[]> {
    const usersToAvoid = await this.findMyUsersToAvoid(currentUser);
    const ids = usersToAvoid.map((user) => user.id);

    const followers = await this.prismaService.follower.findMany({
      where: {
        publisherId: publisher,
        consumerId: {
          not: currentUser,
          notIn: ids,
        },
      },
      select: {
        consumer: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                userName: true,
                avatar: true,
              },
            },
            relatives: {
              where: {
                userBId: currentUser,
              },
              select: {
                status: true,
              },
            },
            relatedTo: {
              where: {
                userAId: currentUser,
              },
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    return followers.map((follower) => {
      const {
        consumer: { user, relatives, relatedTo },
      } = follower;
      let status = RelationshipStatus.UNRELATED;
      if (relatives.length > 0) {
        status = relatives[0].status;
      } else if (relatedTo.length > 0) {
        status = relatedTo[0].status;
      }

      return {
        ...user,
        following: undefined,
        friends: undefined,
        relationStatus: status,
      } as ConsumerDTO;
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
        avatar: true,
        userName: true,
      },
    });

    return user as User;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findByUserName(userName: string): Promise<User | undefined> {
    return this.prismaService.user.findUnique({
      where: {
        userName,
      },
    });
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
            avatar: true,
            userName: true,
          },
        },
        followers: {
          where: {
            consumerId: currentUser,
          },
          select: {
            status: true,
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
      followerStatus:
        followers.length > 0 ? followers[0].status : FollowerStatus.UNRELATED,
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
        AND: {
          OR: [
            { status: RelationshipStatus.ACCEPTED },
            { status: RelationshipStatus.MUTED },
          ],
        },
      },
    });

    const {
      user,
      _count: { following },
    } = consumer;

    const [
      currentUserRelation,
    ] = await this.prismaService.relationship.findMany({
      where: {
        OR: [
          { userAId: consumer.userId, AND: { userBId: currentUser } },
          { userBId: consumer.userId, AND: { userAId: currentUser } },
        ],
      },
      select: {
        status: true,
        updatedBy: true,
      },
    });

    const status = getStatus(currentUserRelation as Relationship, currentUser);

    if (status === RelationshipStatus.BLOCKED_YOU) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The user could not be found',
      );
    }

    return {
      ...user,
      following,
      friends: friendsCount,
      relationStatus: status,
    } as ConsumerDTO;
  }

  async sendFriendRequest(currentUser: string, consumer: string) {
    const relationship = await this.prismaService.relationship.findMany({
      where: {
        OR: [
          { userAId: currentUser, userBId: consumer },
          { userBId: currentUser, userAId: consumer },
        ],
      },
    });

    if (relationship.length > 0) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The friend request could not be sent.',
      );
    }

    await this.prismaService.relationship.create({
      data: {
        userAId: currentUser,
        userBId: consumer,
        status: RelationshipStatus.PENDING,
        updatedBy: currentUser,
        createdOn: new Date(),
        updatedOn: new Date(),
      },
    });

    await this.prismaService.activity.create({
      data: {
        creatorId: currentUser,
        receiverId: consumer,
        type: ActivityType.FRIEND_REQUEST,
        sentOn: new Date(),
      },
    });
  }

  async acceptFriendRequest(currentUser: string, consumer: string) {
    const relationship = await this.prismaService.relationship.findUnique({
      where: {
        userAId_userBId: {
          userAId: consumer,
          userBId: currentUser,
        },
      },
      select: {
        status: true,
        updatedBy: true,
      },
    });

    if (!relationship) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The request could not be accepted.',
      );
    }

    const { status } = relationship;
    const isIncorrectStatus =
      status === RelationshipStatus.ACCEPTED ||
      status === RelationshipStatus.BLOCKED;

    if (isIncorrectStatus) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The request could not be accepted.',
      );
    }

    await this.prismaService.relationship.update({
      where: {
        userAId_userBId: {
          userAId: consumer,
          userBId: currentUser,
        },
      },
      data: {
        status: RelationshipStatus.ACCEPTED,
        updatedBy: currentUser,
        updatedOn: new Date(),
      },
    });

    await this.prismaService.activity.create({
      data: {
        creatorId: currentUser,
        receiverId: consumer,
        type: ActivityType.FRIEND_REQUEST_ACCEPTED,
        sentOn: new Date(),
      },
    });
  }

  async declineFriendRequest(currentUser: string, consumer: string) {
    const relationship = await this.prismaService.relationship.findUnique({
      where: {
        userAId_userBId: {
          userAId: consumer,
          userBId: currentUser,
        },
      },
      select: {
        status: true,
        updatedBy: true,
      },
    });

    if (!relationship) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The request could not be declined.',
      );
    }

    const { status } = relationship;

    if (status !== RelationshipStatus.PENDING) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The request could not be declined.',
      );
    }

    await this.prismaService.relationship.delete({
      where: {
        userAId_userBId: {
          userAId: consumer,
          userBId: currentUser,
        },
      },
    });
  }

  async muteFriend(currentUser: string, consumer: string) {
    const results = await this.prismaService.relationship.findMany({
      where: {
        OR: [
          { userAId: currentUser, userBId: consumer },
          { userBId: currentUser, userAId: consumer },
        ],
      },
      select: {
        userAId: true,
        userBId: true,
        status: true,
        updatedBy: true,
      },
    });

    if (results.length === 0) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The request could not be muted.',
      );
    }

    const [{ status, userAId, userBId }] = results;

    if (status === RelationshipStatus.MUTED) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The request could not be muted.',
      );
    }

    await this.prismaService.relationship.update({
      where: {
        userAId_userBId: {
          userAId,
          userBId,
        },
      },
      data: {
        status: RelationshipStatus.MUTED,
        updatedBy: currentUser,
        updatedOn: new Date(),
      },
    });
  }

  async unMuteFriend(currentUser: string, consumer: string) {
    const results = await this.prismaService.relationship.findMany({
      where: {
        OR: [
          { userAId: currentUser, userBId: consumer },
          { userBId: currentUser, userAId: consumer },
        ],
      },
      select: {
        userAId: true,
        userBId: true,
        status: true,
        updatedBy: true,
      },
    });

    if (results.length === 0) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The request could not be unmuted.',
      );
    }

    const [{ status, userAId, userBId, updatedBy }] = results;
    const cantUnMute =
      status !== RelationshipStatus.MUTED || updatedBy !== currentUser;

    if (cantUnMute) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The request could not be unmuted.',
      );
    }

    await this.prismaService.relationship.update({
      where: {
        userAId_userBId: {
          userAId,
          userBId,
        },
      },
      data: {
        status: RelationshipStatus.ACCEPTED,
        updatedBy: currentUser,
        updatedOn: new Date(),
      },
    });
  }

  async blockFriend(currentUser: string, consumer: string) {
    const results = await this.prismaService.relationship.findMany({
      where: {
        OR: [
          { userAId: currentUser, userBId: consumer },
          { userBId: currentUser, userAId: consumer },
        ],
      },
      select: {
        userAId: true,
        userBId: true,
        status: true,
        updatedBy: true,
      },
    });

    if (results.length === 0) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The request could not be blocked.',
      );
    }

    const [{ status, userAId, userBId }] = results;

    if (status === RelationshipStatus.BLOCKED) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The request could not be blocked.',
      );
    }

    await this.prismaService.relationship.update({
      where: {
        userAId_userBId: {
          userAId,
          userBId,
        },
      },
      data: {
        status: RelationshipStatus.BLOCKED,
        updatedBy: currentUser,
        updatedOn: new Date(),
      },
    });
  }

  async unBlockFriend(currentUser: string, consumer: string) {
    const results = await this.prismaService.relationship.findMany({
      where: {
        OR: [
          { userAId: currentUser, userBId: consumer },
          { userBId: currentUser, userAId: consumer },
        ],
      },
      select: {
        userAId: true,
        userBId: true,
        status: true,
        updatedBy: true,
      },
    });

    if (results.length === 0) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The request could not be unblocked.',
      );
    }

    const [{ status, userAId, userBId, updatedBy }] = results;
    const cantUnBlock =
      status !== RelationshipStatus.BLOCKED || updatedBy !== currentUser;

    if (cantUnBlock) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The request could not be unblocked.',
      );
    }

    await this.prismaService.relationship.update({
      where: {
        userAId_userBId: {
          userAId,
          userBId,
        },
      },
      data: {
        status: RelationshipStatus.ACCEPTED,
        updatedBy: currentUser,
        updatedOn: new Date(),
      },
    });
  }

  async removeFriend(currentUser: string, consumer: string) {
    const results = await this.prismaService.relationship.findMany({
      where: {
        OR: [
          { userAId: currentUser, userBId: consumer },
          { userBId: currentUser, userAId: consumer },
        ],
      },
      select: {
        userAId: true,
        userBId: true,
        status: true,
        updatedBy: true,
      },
    });

    if (results.length === 0) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The request could not be unblocked.',
      );
    }

    const [{ status, userAId, userBId }] = results;

    if (status === RelationshipStatus.PENDING) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The request could not be removed.',
      );
    }

    await this.prismaService.relationship.delete({
      where: {
        userAId_userBId: {
          userAId,
          userBId,
        },
      },
    });
  }

  async follow(currentUser: string, publisherId: string) {
    const publisher = await this.prismaService.publisher.findUnique({
      where: {
        userId: publisherId,
      },
      select: {
        userId: true,
      },
    });

    if (!publisher) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The publisher does not exists',
      );
    }

    const relation = await this.prismaService.follower.findUnique({
      where: {
        consumerId_publisherId: {
          consumerId: currentUser,
          publisherId: publisherId,
        },
      },
    });

    if (!!relation) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'You already follow this publisher',
      );
    }

    return this.prismaService.follower.create({
      data: {
        consumerId: currentUser,
        publisherId: publisherId,
        updatedBy: currentUser,
        status: FollowerStatus.FOLLOWING,
      },
    });
  }

  async mutePublisher(currentUser: string, publisher: string) {
    const result = await this.prismaService.follower.findUnique({
      where: {
        consumerId_publisherId: {
          consumerId: currentUser,
          publisherId: publisher,
        },
      },
      select: {
        status: true,
      },
    });

    if (!result) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The publisher could not be muted.',
      );
    }

    const { status } = result;

    if (status === FollowerStatus.MUTED) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The publisher could not be muted.',
      );
    }

    await this.prismaService.follower.update({
      where: {
        consumerId_publisherId: {
          consumerId: currentUser,
          publisherId: publisher,
        },
      },
      data: {
        status: FollowerStatus.MUTED,
        updatedBy: currentUser,
        updatedOn: new Date(),
      },
    });
  }

  async unMutePublisher(currentUser: string, publisher: string) {
    const result = await this.prismaService.follower.findUnique({
      where: {
        consumerId_publisherId: {
          consumerId: currentUser,
          publisherId: publisher,
        },
      },
      select: {
        status: true,
        updatedBy: true,
      },
    });

    if (!result) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The publisher could not be unmuted.',
      );
    }

    const { status, updatedBy } = result;
    const cantUnMute =
      status !== FollowerStatus.MUTED || updatedBy !== currentUser;

    if (cantUnMute) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The publisher could not be unmuted.',
      );
    }

    await this.prismaService.follower.update({
      where: {
        consumerId_publisherId: {
          consumerId: currentUser,
          publisherId: publisher,
        },
      },
      data: {
        status: FollowerStatus.FOLLOWING,
        updatedBy: currentUser,
        updatedOn: new Date(),
      },
    });
  }

  async blockPublisher(currentUser: string, publisher: string) {
    const result = await this.prismaService.follower.findUnique({
      where: {
        consumerId_publisherId: {
          consumerId: currentUser,
          publisherId: publisher,
        },
      },
      select: {
        status: true,
      },
    });

    if (!result) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The publisher could not be blocked.',
      );
    }

    const { status } = result;

    if (status === FollowerStatus.BLOCKED) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The request could not be blocked.',
      );
    }

    await this.prismaService.follower.update({
      where: {
        consumerId_publisherId: {
          consumerId: currentUser,
          publisherId: publisher,
        },
      },
      data: {
        status: FollowerStatus.BLOCKED,
        updatedBy: currentUser,
        updatedOn: new Date(),
      },
    });
  }

  async unBlockPublisher(currentUser: string, publisher: string) {
    const result = await this.prismaService.follower.findUnique({
      where: {
        consumerId_publisherId: {
          consumerId: currentUser,
          publisherId: publisher,
        },
      },
      select: {
        status: true,
        updatedBy: true,
      },
    });

    if (!result) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The publisher could not be unblocked.',
      );
    }

    const { status, updatedBy } = result;
    const cantUnBlock =
      status !== FollowerStatus.BLOCKED || updatedBy !== currentUser;

    if (cantUnBlock) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The publisher could not be unblocked.',
      );
    }

    await this.prismaService.follower.update({
      where: {
        consumerId_publisherId: {
          consumerId: currentUser,
          publisherId: publisher,
        },
      },
      data: {
        status: FollowerStatus.FOLLOWING,
        updatedBy: currentUser,
        updatedOn: new Date(),
      },
    });
  }

  async removePublisher(currentUser: string, publisher: string) {
    const result = await this.prismaService.follower.findUnique({
      where: {
        consumerId_publisherId: {
          consumerId: currentUser,
          publisherId: publisher,
        },
      },
      select: {
        status: true,
        updatedBy: true,
      },
    });

    if (!result) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'The publisher could not be unfollowed.',
      );
    }

    await this.prismaService.follower.delete({
      where: {
        consumerId_publisherId: {
          consumerId: currentUser,
          publisherId: publisher,
        },
      },
    });
  }

  async create(userCreate: Prisma.UserCreateInput): Promise<User> {
    return await this.prismaService.user.create({
      data: userCreate,
    });
  }

  async createConsumer(userData: Prisma.UserCreateInput) {
    const user = await this.prismaService.user.create({
      data: userData,
    });

    return await this.prismaService.consumer.create({
      data: {
        userId: user.id,
      },
      select: {
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
