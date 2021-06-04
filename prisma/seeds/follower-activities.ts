import { PrismaClient } from '.prisma/client';
import * as faker from 'faker';

export default async function seedFollowerActivities(prisma: PrismaClient) {
  console.log('Sedding follower related activities');

  const loginUser = await prisma.user.findUnique({
    where: {
      email: 'ale@gmail.com',
    },
    select: {
      id: true,
      follower: {
        select: {
          following: {
            select: {
              userId: true,
            },
          },
          friends: {
            select: {
              userId: true,
              eventsFollowed: true,
            },
          },
          receivedRequests: {
            select: {
              creatorId: true,
            },
          },
        },
      },
    },
  });

  const {
    follower: { following, friends, receivedRequests },
  } = loginUser;

  const followedPublishers = following.map((pub) => ({
    type: 4,
    creatorId: loginUser.id,
    receiverId: pub.userId,
    dateSent: faker.date.past(0, new Date()),
    seen: faker.datatype.boolean(),
  }));

  const friendRequestsReceived = receivedRequests.map((req) => ({
    type: 5,
    creatorId: req.creatorId,
    receiverId: loginUser.id,
    dateSent: faker.date.past(0, new Date()),
    seen: faker.datatype.boolean(),
  }));

  const friendRequestsAccepted = friends.map((friend) => ({
    type: 6,
    creatorId: friend.userId,
    receiverId: loginUser.id,
    dateSent: faker.date.past(0, new Date()),
    seen: faker.datatype.boolean(),
  }));

  const inviters = faker.random.arrayElements(friends);
  const invitations = inviters.map((friend) => ({
    type: 0,
    creatorId: friend.userId,
    receiverId: loginUser.id,
    eventId: faker.random.arrayElement(friend.eventsFollowed).id,
    dateSent: faker.date.past(0, new Date()),
    seen: faker.datatype.boolean(),
  }));

  await prisma.activity.createMany({
    data: [
      ...invitations,
      ...friendRequestsReceived,
      ...friendRequestsAccepted,
      ...followedPublishers,
    ],
  });
}
