import {
  PrismaClient,
  Follower,
  Publisher,
  FriendRequest,
} from '@prisma/client';
import * as faker from 'faker';

export default async function seedFollowersRelations(prisma: PrismaClient) {
  console.log('Seeding followers relationships');

  const publishers: Publisher[] = await prisma.publisher.findMany({
    include: { user: true },
  });
  const friendsPool: Follower[] = await prisma.follower.findMany({
    include: { user: true },
  });
  let follower = friendsPool.shift();

  while (friendsPool.length > 0) {
    const startAtFront = faker.datatype.boolean();
    const friendsCount = faker.datatype.number({
      min: 0,
      max: friendsPool.length - 1,
    });

    let friendsSlice = [];
    let requestsSlice = [];

    if (friendsCount > 0) {
      friendsSlice = startAtFront
        ? friendsPool.slice(0, friendsCount)
        : friendsPool.slice(friendsCount);

      requestsSlice = startAtFront
        ? friendsPool.slice(friendsCount)
        : friendsPool.slice(0, friendsCount);
    }

    const friends = friendsSlice.map((fr) => ({ userId: fr.userId }));

    const following = faker.random
      .arrayElements(publishers)
      .map((pub) => ({ userId: pub.userId }));

    await prisma.follower.update({
      where: {
        userId: follower.userId,
      },
      data: {
        friends: {
          connect: friends,
        },
        following: {
          connect: following,
        },
      },
    });

    const friendRequests: FriendRequest[] = requestsSlice.map((fr) => ({
      creatorId: fr.userId,
      receiverId: follower.userId,
      dateSent: faker.date.past(0, new Date()),
    }));

    await prisma.friendRequest.createMany({
      data: friendRequests,
      skipDuplicates: true,
    });

    console.log('Seeding user related activities');

    const frReceivedActivities = requestsSlice.map((fr) => ({
      creatorId: fr.userId,
      receiverId: follower.userId,
      type: 5,
      dateSent: faker.date.past(0, new Date()),
      seen: faker.datatype.boolean(),
    }));

    const frAcceptedActivities = friendsSlice.map((fr) => ({
      creatorId: fr.userId,
      receiverId: follower.userId,
      type: 6,
      dateSent: faker.date.past(0, new Date()),
      seen: faker.datatype.boolean(),
    }));

    const followingActivities = following.map((pub) => ({
      creatorId: follower.userId,
      receiverId: pub.userId,
      type: 4,
      dateSent: faker.date.past(0, new Date()),
      seen: faker.datatype.boolean(),
    }));

    await prisma.activity.createMany({
      data: [
        ...frReceivedActivities,
        ...frAcceptedActivities,
        ...followingActivities,
      ],
      skipDuplicates: true,
    });

    follower = friendsPool.shift();
  }
}
