import { PrismaClient, User } from '@prisma/client';
import * as faker from 'faker';
import * as bcrypt from 'bcrypt';
import { VerificationLevel } from '../../src/constants/user';

const loginUser = {
  name: 'Alejandro Yanes',
  userName: 'alejandro.yanes94',
  password: bcrypt.hashSync('Aa12345!!', 10),
  email: 'ale@gmail.com',
  avatar: 'user4',
  verificationCode: 123456,
  verificationLevel: VerificationLevel.USER_INFO_ADDED,
  theme: 'SummerVibes',
  useDarkStyle: true,
};

export default async function seedUsers(prisma: PrismaClient) {
  console.log('Seeding users (consumers)');

  const users = new Array(30).fill(1).map(() => {
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

  const extendedUsers = [loginUser, ...users];

  for (const user of extendedUsers) {
    const dbUser = await prisma.user.create({
      data: user,
    });

    await prisma.consumer.create({
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
