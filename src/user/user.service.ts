import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, Relationship, User } from '@prisma/client';
import { FollowerStatus, RelationshipStatus } from '../constants/user';
import { ActivityType } from '../constants/activities';
import { QueryParams } from '../constants/queries';
import { ApiException } from '../core/exceptions/api-exception';
import { PagedResponse } from '../core/responses/paged-response';
import { PrismaService } from '../prisma/prisma.service';
import { ConsumerDTO } from './models/consumer';
import { PublisherDTO } from './models/publisher';
import { UserDTO } from './models/user.dto';
import getStatus from './utils/get-status';
import buildPublisherDto from './utils/build-publisher-dto';
import buildAvatarUrl from '../helpers/build-avatar-url';
import { generateCode } from '../helpers/generators';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findMyStats(userId: string) {
    const friendsCount = await this.prismaService.relationship.count({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        AND: {
          OR: [
            { status: RelationshipStatus.ACCEPTED },
            { status: RelationshipStatus.MUTED },
          ],
        },
      },
    });

    const followingCount = await this.prismaService.follower.count({
      where: {
        consumerId: userId,
        AND: {
          OR: [
            { status: FollowerStatus.FOLLOWING },
            { status: FollowerStatus.MUTED },
          ],
        },
      },
    });

    return { friends: friendsCount, following: followingCount };
  }

  async findMyPublishers(
    currentUser: string,
    queryParams: QueryParams,
  ): Promise<PagedResponse<PublisherDTO>> {
    const { page, limit } = queryParams;
    const publishersToAvoid = await this.findMyPublishersToAvoid(currentUser);
    const ids = publishersToAvoid.map((p) => p.id);
    const filters = {
      consumerId: currentUser,
      publisherId: { notIn: ids },
    };

    const publishers = await this.prismaService.follower.findMany({
      where: filters,
      skip: page ? (limit || 0) * (page - 1) : 0,
      take: limit || undefined,
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

    if (publishers.length === 0) {
      return { results: [], page, count: 0 };
    }

    const count = await this.prismaService.follower.count({
      where: filters,
    });

    const results = publishers.map(({ publisher, status }) =>
      buildPublisherDto({ publisher, status, currentUser }),
    );

    return { results, page, count };
  }

  async findMyFollowers(
    id: string,
    queryParams: QueryParams,
  ): Promise<PagedResponse<UserDTO>> {
    const { page, limit } = queryParams;
    const filters = {
      publisherId: id,
      status: { not: FollowerStatus.BLOCKED },
    };

    const followers = await this.prismaService.follower.findMany({
      where: filters,
      skip: page ? (limit || 0) * (page - 1) : 0,
      take: limit || undefined,
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

    if (followers.length === 0) {
      return { results: [], page, count: 0 };
    }

    const count = await this.prismaService.follower.count({
      where: filters,
    });
    const results = followers.map((f) => ({
      ...f.consumer.user,
      avatar: buildAvatarUrl(f.consumer.user.avatar),
    }));

    return { results, page, count };
  }

  async findMyFriends(
    currentUser: string,
    queryParams: QueryParams,
  ): Promise<PagedResponse<ConsumerDTO>> {
    const { page, limit } = queryParams;
    const filters = {
      OR: [{ userAId: currentUser }, { userBId: currentUser }],
      AND: {
        OR: [
          { status: RelationshipStatus.ACCEPTED },
          { status: RelationshipStatus.MUTED },
        ],
      },
    };

    const friends = await this.prismaService.relationship.findMany({
      where: filters,
      skip: page ? (limit || 0) * (page - 1) : 0,
      take: limit || undefined,
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

    if (friends.length === 0) {
      return { results: [], page, count: 0 };
    }

    const count = await this.prismaService.relationship.count({
      where: filters,
    });

    const results = friends.map((relation) => {
      const user =
        (currentUser === relation.userAId && relation.userB.user) ||
        (currentUser === relation.userBId && relation.userA.user);

      return {
        ...user,
        avatar: buildAvatarUrl(user.avatar),
        following: undefined,
        friends: undefined,
        relationStatus: relation.status,
      };
    });

    return { results, page, count };
  }

  async findMyPendingRequests(
    currentUser: string,
    queryParams: QueryParams,
  ): Promise<PagedResponse<ConsumerDTO>> {
    const { page, limit } = queryParams;
    const filters = {
      userBId: currentUser,
      AND: {
        status: RelationshipStatus.PENDING,
      },
    };

    const pending = await this.prismaService.relationship.findMany({
      where: filters,
      skip: page ? (limit || 0) * (page - 1) : 0,
      take: limit || undefined,
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

    if (pending.length === 0) {
      return { results: [], page, count: 0 };
    }

    const count = await this.prismaService.relationship.count({
      where: filters,
    });

    const results = pending.map((relation) => {
      const user = relation.userA.user;

      return {
        ...user,
        avatar: buildAvatarUrl(user.avatar),
        following: undefined,
        friends: undefined,
        relationStatus: relation.status,
      };
    });

    return { results, page, count };
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
      return (userA && userA.user) || (userB && userB.user);
    });
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
    queryParams: QueryParams,
  ): Promise<PagedResponse<PublisherDTO>> {
    const { page, limit } = queryParams;
    const publishersToAvoid = await this.findMyPublishersToAvoid(currentUser);
    const ids = publishersToAvoid.map((p) => p.id);
    const filters = {
      OR: [
        { consumerId: userId },
        { consumer: { user: { userName: userId } } },
      ],
      publisherId: { notIn: ids },
    };

    const following = await this.prismaService.follower.findMany({
      where: filters,
      skip: page ? (limit || 0) * (page - 1) : 0,
      take: limit || undefined,
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
                consumer: {
                  select: {
                    user: {
                      select: {
                        id: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (following.length === 0) {
      return { results: [], page, count: 0 };
    }

    const count = await this.prismaService.follower.count({
      where: filters,
    });

    const results = following.map(({ publisher }) =>
      buildPublisherDto({ publisher, currentUser }),
    );

    return { results, page, count };
  }

  async findFriendsOf(
    consumerId: string,
    currentUser: string,
    queryParams: QueryParams,
  ): Promise<PagedResponse<ConsumerDTO>> {
    const { page, limit } = queryParams;
    const usersToAvoid = await this.findMyUsersToAvoid(currentUser);
    const ids = usersToAvoid.map((user) => user.id);
    ids.push(currentUser);
    const filters = {
      OR: [
        {
          userAId: consumerId,
          // OR: [
          //   { userAId: consumerId },
          //   { userA: { user: { userName: consumerId } } },
          // ],
          userBId: { notIn: ids },
        },
        {
          userBId: consumerId,
          // OR: [
          //   { userBId: consumerId },
          //   { userB: { user: { userName: consumerId } } },
          // ],
          userAId: { notIn: ids },
        },
      ],
      AND: {
        OR: [
          { status: RelationshipStatus.ACCEPTED },
          { status: RelationshipStatus.MUTED },
        ],
      },
    };

    const friends = await this.prismaService.relationship.findMany({
      where: filters,
      skip: page ? (limit || 0) * (page - 1) : 0,
      take: limit || undefined,
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
                status: { not: RelationshipStatus.BLOCKED },
              },
              select: {
                status: true,
                updatedBy: true,
              },
            },
            relatedTo: {
              where: {
                userAId: currentUser,
                status: { not: RelationshipStatus.BLOCKED },
              },
              select: {
                status: true,
                updatedBy: true,
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

    if (friends.length === 0) {
      return { results: [], page, count: 0 };
    }

    const count = await this.prismaService.relationship.count({
      where: filters,
    });

    const results = friends.map((relation) => {
      const consumer =
        (consumerId === relation.userAId && relation.userB) ||
        (consumerId === relation.userBId && relation.userA);

      const { user, relatives, relatedTo } = consumer;
      const userRelation =
        (relatives?.length > 0 && relatives[0]) ||
        (relatedTo?.length > 0 && relatedTo[0]);
      const status = getStatus(userRelation as Relationship, currentUser);

      return {
        ...user,
        avatar: buildAvatarUrl(user.avatar),
        relationStatus: status,
      };
    });

    return { results, page, count };
  }

  async findFollowersOf(
    currentUser: string,
    publisher: string,
    queryParams: QueryParams,
  ): Promise<PagedResponse<ConsumerDTO>> {
    const { page, limit } = queryParams;
    const usersToAvoid = await this.findMyUsersToAvoid(currentUser);
    const ids = usersToAvoid.map((user) => user.id);
    const filters = {
      OR: [
        { publisherId: publisher },
        { publisher: { user: { userName: publisher } } },
      ],
      consumerId: {
        not: currentUser,
        notIn: ids,
      },
    };

    const followers = await this.prismaService.follower.findMany({
      where: filters,
      skip: page ? (limit || 0) * (page - 1) : 0,
      take: limit || undefined,
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

    if (followers.length === 0) {
      return { results: [], page, count: 0 };
    }

    const count = await this.prismaService.follower.count({
      where: filters,
    });

    const results = followers.map((follower) => {
      const {
        consumer: { user, relatives, relatedTo },
      } = follower;
      const userRelation =
        (relatives.length > 0 && relatives[0]) ||
        (relatedTo.length > 0 && relatedTo[0]);
      const status = getStatus(userRelation as Relationship, currentUser);

      return {
        ...user,
        avatar: buildAvatarUrl(user.avatar),
        relationStatus: status,
      } as ConsumerDTO;
    });

    return { results, page, count };
  }

  async findById(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
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
    const publisher = await this.prismaService.publisher.findFirst({
      where: {
        OR: [{ userId: id }, { user: { userName: id } }],
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
            events: true,
            followers: true,
          },
        },
      },
    });

    return buildPublisherDto({ publisher, currentUser });
  }

  async findConsumerById(
    id: string,
    currentUser: string,
  ): Promise<ConsumerDTO> {
    const consumer = await this.prismaService.consumer.findFirst({
      where: {
        OR: [{ userId: id }, { user: { userName: id } }],
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
      avatar: buildAvatarUrl(user.avatar),
      count: {
        following,
        friends: friendsCount,
      },
      relationStatus: status,
    } as ConsumerDTO;
  }

  async searchPublishers(
    term: string,
    currentUser: string,
  ): Promise<PublisherDTO[]> {
    const publishersToAvoid = await this.findMyPublishersToAvoid(currentUser);
    const ids = publishersToAvoid.map((p) => p.id);
    const publishers = await this.prismaService.publisher.findMany({
      where: {
        userId: { notIn: ids },
        user: {
          name: { contains: term, mode: 'insensitive' },
          userName: { contains: term, mode: 'insensitive' },
        },
      },
      orderBy: {
        user: {
          userName: 'asc',
        },
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
                        userBId: currentUser,
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
                        userAId: currentUser,
                      },
                    },
                  },
                },
                {
                  userId: currentUser,
                },
              ],
            },
          },
          select: {
            status: true,
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
            events: true,
          },
        },
      },
    });

    return publishers.map((publisher) =>
      buildPublisherDto({ publisher, currentUser, pickFriends: true }),
    );
  }

  async searchConsumers(
    term: string,
    currentUser: string,
  ): Promise<ConsumerDTO[]> {
    const usersToAvoid = await this.findMyUsersToAvoid(currentUser);
    const ids = usersToAvoid.map((user) => user.id);
    ids.push(currentUser);

    const consumers = await this.prismaService.consumer.findMany({
      where: {
        userId: { notIn: ids },
        user: {
          name: { contains: term, mode: 'insensitive' },
          userName: { contains: term, mode: 'insensitive' },
        },
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
        _count: {
          select: {
            following: true,
          },
        },
      },
    });

    const sortByName = (a, b) => {
      const aName = a.user.name.toLowerCase();
      const bName = b.user.name.toLowerCase();

      return aName.localeCompare(bName);
    };
    consumers.sort(sortByName);

    const extendedConsumers: ConsumerDTO[] = [];

    for (const consumer of consumers) {
      const { user, _count } = consumer;
      const [
        currentUserRelation,
      ] = await this.prismaService.relationship.findMany({
        where: {
          OR: [
            { userAId: user.id, AND: { userBId: currentUser } },
            { userBId: user.id, AND: { userAId: currentUser } },
          ],
        },
        select: {
          status: true,
          updatedBy: true,
        },
      });
      const status = getStatus(
        currentUserRelation as Relationship,
        currentUser,
      );

      const friends = await this.prismaService.relationship.findMany({
        take: 4,
        where: {
          AND: [
            {
              OR: [
                {
                  userAId: user.id,
                  AND: {
                    userB: {
                      userId: { notIn: ids },
                      AND: {
                        OR: [
                          {
                            relatives: {
                              some: {
                                userBId: currentUser,
                                AND: {
                                  OR: [
                                    { status: RelationshipStatus.ACCEPTED },
                                    { status: RelationshipStatus.MUTED },
                                  ],
                                },
                              },
                            },
                          },
                          {
                            relatedTo: {
                              some: {
                                userAId: currentUser,
                                AND: {
                                  OR: [
                                    { status: RelationshipStatus.ACCEPTED },
                                    { status: RelationshipStatus.MUTED },
                                  ],
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
                {
                  userBId: user.id,
                  AND: {
                    userA: {
                      userId: { notIn: ids },
                      AND: {
                        OR: [
                          {
                            relatives: {
                              some: {
                                userBId: currentUser,
                                AND: {
                                  OR: [
                                    { status: RelationshipStatus.ACCEPTED },
                                    { status: RelationshipStatus.MUTED },
                                  ],
                                },
                              },
                            },
                          },
                          {
                            relatedTo: {
                              some: {
                                userAId: currentUser,
                                AND: {
                                  OR: [
                                    { status: RelationshipStatus.ACCEPTED },
                                    { status: RelationshipStatus.MUTED },
                                  ],
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
            {
              OR: [
                { status: RelationshipStatus.ACCEPTED },
                { status: RelationshipStatus.MUTED },
              ],
            },
          ],
        },
        select: {
          userA: {
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
          userB: {
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
        },
      });

      const normalizedFriends = friends.map(({ userA, userB }) => {
        const { user } = userA || userB;

        return {
          id: user.id,
          avatar: buildAvatarUrl(user.avatar),
        };
      });

      const friendsCount = await this.prismaService.relationship.count({
        where: {
          AND: [
            { OR: [{ userAId: user.id }, { userBId: user.id }] },
            {
              OR: [
                { status: RelationshipStatus.MUTED },
                { status: RelationshipStatus.ACCEPTED },
              ],
            },
          ],
        },
      });

      extendedConsumers.push({
        ...user,
        avatar: buildAvatarUrl(user.avatar),
        friends: normalizedFriends,
        count: {
          friends: friendsCount,
          following: _count.following,
        },
        relationStatus: status,
      });
    }

    return extendedConsumers;
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

    await this.prismaService.follower.create({
      data: {
        consumerId: currentUser,
        publisherId: publisherId,
        updatedBy: currentUser,
        status: FollowerStatus.FOLLOWING,
      },
    });

    await this.prismaService.activity.create({
      data: {
        creatorId: currentUser,
        receiverId: publisherId,
        type: ActivityType.NEW_FOLLOWER,
        sentOn: new Date(),
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
      data: {
        ...userData,
        userName: await this.generateUserName(userData),
      },
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

  private async generateUserName(
    user: Prisma.UserCreateInput,
  ): Promise<string> {
    const { email, name, lastName } = user;
    let newUserName = email.split('@')[0];
    let foundUser = await this.findByUserName(newUserName);

    if (!foundUser) {
      return newUserName;
    }

    const fullName = `${name}${lastName}`;
    newUserName = fullName.replace(/ /g, '').toLocaleLowerCase();
    foundUser = await this.findByUserName(newUserName);

    while (foundUser) {
      newUserName = `${email}${generateCode()}`;
      foundUser = await this.findByUserName(newUserName);
    }

    return newUserName;
  }
}
