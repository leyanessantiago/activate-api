import { PrismaClient } from '.prisma/client';
import * as faker from 'faker';
import { RelationshipStatus } from '../../src/constants/user';

export default async function seedConsumerActivities(prisma: PrismaClient) {
  console.log('Seeding consumer related activities');

  const loginUser = await prisma.user.findUnique({
    where: {
      email: 'ale@gmail.com',
    },
    select: {
      id: true,
      consumer: {
        select: {
          following: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  const {
    id,
    consumer: { following },
  } = loginUser;

  const receivedRequests = await prisma.relationship.findMany({
    where: {
      OR: [{ userAId: id }, { userBId: id }],
      AND: [{ status: RelationshipStatus.PENDING }, { updatedBy: { not: id } }],
    },
  });

  const friends = await prisma.relationship.findMany({
    where: {
      OR: [{ userAId: id }, { userBId: id }],
      AND: [{ status: RelationshipStatus.ACCEPTED }],
    },
    select: {
      userAId: true,
      userBId: true,
      userA: {
        select: {
          eventsFollowed: true,
        },
      },
      userB: {
        select: {
          eventsFollowed: true,
        },
      },
    },
  });

  const followedPublishers = following.map((pub) => ({
    type: 4,
    creatorId: loginUser.id,
    receiverId: pub.userId,
    dateSent: faker.date.past(0, new Date()),
    seen: faker.datatype.boolean(),
  }));

  const friendRequestsReceived = receivedRequests.map((req) => ({
    type: 5,
    creatorId: req.userAId,
    receiverId: loginUser.id,
    dateSent: faker.date.past(0, new Date()),
    seen: faker.datatype.boolean(),
  }));

  const friendRequestsAccepted = friends.map((friend) => ({
    type: 6,
    creatorId: friend?.userAId || friend?.userBId,
    receiverId: loginUser.id,
    dateSent: faker.date.past(0, new Date()),
    seen: faker.datatype.boolean(),
  }));

  const inviters = faker.random.arrayElements(friends);
  const invitations = inviters.map((friend) => ({
    type: 0,
    creatorId: friend?.userAId || friend?.userBId,
    receiverId: loginUser.id,
    eventId: faker.random.arrayElement(
      (friend.userA || friend.userB).eventsFollowed,
    ).id,
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
