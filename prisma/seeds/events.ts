import {
  PrismaClient,
  Publisher,
  Event,
  Comment,
  Follower,
  Category,
} from '@prisma/client';
import * as faker from 'faker';

function generateComments(eventDate: string | Date, users: Follower[]) {
  return new Array(faker.datatype.number({ min: 5, max: 15 }))
    .fill(1)
    .map(() => {
      const author = users[faker.datatype.number({ min: 0, max: 29 })];
      const hasResponse = faker.datatype.boolean();
      const response = hasResponse ? faker.lorem.lines(4) : undefined;
      const dateResponded = hasResponse
        ? faker.date.past(0, eventDate)
        : undefined;

      return {
        authorId: author.userId,
        content: faker.lorem.lines(4),
        dateCreated: faker.date.past(0, eventDate),
        response,
        dateResponded,
      } as Comment;
    });
}

const images: string[] = [
  'baking-event.jpeg',
  'comedy-show.jpeg',
  'feminist-event.jpeg',
  'virtual-tour.jpeg',
];

export default async function seedEvents(prisma: PrismaClient) {
  console.log('Seeding events');

  const publishers: Publisher[] = await prisma.publisher.findMany({
    include: { user: true },
  });
  const users: Follower[] = await prisma.follower.findMany({
    include: { user: true },
  });
  const categories: Category[] = await prisma.category.findMany();

  const events = new Array(20).fill(1).map(() => {
    const { DOMAIN_NAME, API_PREFIX } = process.env;
    const domain = `${DOMAIN_NAME}/${API_PREFIX}`;
    const imageName = faker.random.arrayElement(images);
    const image = `${domain}/event/image/${imageName}`;
    const authorId = faker.random.arrayElement(publishers).userId;
    const categoryId = faker.random.arrayElement(categories).id;

    return {
      image,
      authorId,
      categoryId,
      name: faker.lorem.words(6),
      address: faker.address.secondaryAddress(),
      date: faker.date.future(),
      description: faker.lorem.lines(8),
    } as Event;
  });

  for (const event of events) {
    const comments = generateComments(event.date, users);

    const dbEvent = await prisma.event.create({
      data: {
        ...event,
        comments: {
          create: comments,
        },
      },
    });

    const followers = faker.random
      .arrayElements(users)
      .map((follower) => ({ userId: follower.userId }));

    await prisma.event.update({
      where: { id: dbEvent.id },
      data: {
        followers: {
          connect: followers,
        },
      },
    });
  }
}
