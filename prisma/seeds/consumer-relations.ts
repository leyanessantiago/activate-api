import {
  PrismaClient,
  Consumer,
  Publisher,
  FriendRequest,
} from '@prisma/client';
import * as faker from 'faker';

export default async function seedConsumerRelations(prisma: PrismaClient) {
  console.log('Seeding consumer relationships');

  const publishers: Publisher[] = await prisma.publisher.findMany({
    include: { user: true },
  });
  const friendsPool: Consumer[] = await prisma.consumer.findMany({
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

    await prisma.consumer.update({
      where: {
        userId: follower.userId,
      },
      data: {
        friends: {
          connect: friends,
        },
        friendOf: {
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

    follower = friendsPool.shift();
  }
}
