import { PrismaClient, User } from '@prisma/client';
import * as faker from 'faker';
import * as bcrypt from 'bcrypt';
import { VerificationLevel } from '../../src/constants/user';

export default async function seedPublishers(prisma: PrismaClient) {
  console.log('Seeding users (publishers)');

  const users = new Array(15).fill(1).map(() => {
    const gender = faker.random.arrayElement(['male', 'female']);
    const firstName = faker.name.firstName(gender as any);
    const lastName = faker.name.lastName(gender as any);
    const userName = faker.internet
      .userName(firstName, lastName)
      .toLocaleLowerCase();
    const avatar =
      gender === 'female'
        ? faker.random.arrayElement(['user1', 'user2'])
        : faker.random.arrayElement(['user3', 'user4']);

    const password = faker.internet.password(8, true);
    const passwordHash = bcrypt.hashSync(password, 10);

    return {
      avatar,
      userName,
      name: `${firstName} ${lastName}`,
      password: passwordHash,
      email: faker.internet.email(firstName, lastName, 'gmail.com'),
      verificationLevel: VerificationLevel.INTERESTS_ADDED,
      verificationCode: faker.datatype.number({ min: 100000, max: 999999 }),
    } as User;
  });

  for (const user of users) {
    const dbUser = await prisma.user.create({
      data: user,
    });

    await prisma.publisher.create({
      data: {
        user: {
          connect: {
            id: dbUser.id,
          },
        },
      },
    });
  }
}
