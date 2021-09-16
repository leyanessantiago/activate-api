import {
  PrismaClient,
  Publisher,
  Event,
  Comment,
  Consumer,
  Category,
} from '@prisma/client';
import * as faker from 'faker';

function generateComments(eventDate: string | Date, users: Consumer[]) {
  return new Array(faker.datatype.number({ min: 5, max: 15 }))
    .fill(1)
    .map(() => {
      const author = users[faker.datatype.number({ min: 0, max: 29 })];
      const hasResponse = faker.datatype.boolean();
      const response = hasResponse ? faker.lorem.lines(4) : undefined;
      const respondedOn = hasResponse
        ? faker.date.past(0, eventDate)
        : undefined;

      return {
        authorId: author.userId,
        content: faker.lorem.lines(4),
        createdOn: faker.date.past(0, eventDate),
        response,
        respondedOn,
      } as Comment;
    });
}

const images: string[] = [
  '1fd9e63c7cdf9a09c2c9fc7c31a1682b.jpg',
  '41d0c6da9c54c656991f2da4bb88ca57.jpg',
  '2313c6c31959bf1564d1d097b2ab67e5.jpg',
  'b87b7e466d5e80add314c500ffda92ee.jpg',
  'c1319ac73aa26148197f3967ad65a746.jpg',
  '23e1ca18852cc8964175e89ca187d633.jpg',
  '008d91e90a5311c10ee2b84c10988374.jpg',
  '69a7ccf39060bc28cfa5b0becf342fcd.jpg',
  '91f6fcba1bb15027915fa779e94f4457.jpg',
];

export default async function seedEvents(prisma: PrismaClient) {
  console.log('Seeding events');

  const publishers: Publisher[] = await prisma.publisher.findMany({
    include: { user: true },
  });
  const users: Consumer[] = await prisma.consumer.findMany({
    include: { user: true },
  });
  const categories: Category[] = await prisma.category.findMany();

  const events = new Array(20).fill(1).map(() => {
    const image = faker.random.arrayElement(images);
    const authorId = faker.random.arrayElement(publishers).userId;
    const categoryId = faker.random.arrayElement(categories).id;

    return {
      image,
      authorId,
      categoryId,
      name: faker.lorem.words(6),
      address: faker.address.streetAddress(true),
      date: faker.date.future(),
      description: faker.lorem.lines(8),
    } as Event;
  });

  for (const event of events) {
    const comments = generateComments(event.date, users);

    await prisma.event.create({
      data: {
        ...event,
        comments: {
          create: comments,
        },
      },
    });
  }
}
