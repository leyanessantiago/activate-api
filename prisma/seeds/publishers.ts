import { PrismaClient, User } from '@prisma/client';
import * as faker from 'faker';
import * as bcrypt from 'bcrypt';
import { VerificationLevel } from '../../src/constants/user';

const publisher = {
  avatar: 'user4',
  name: 'DevLand',
  userName: 'devlandCuba',
  email: `devland.cuba@gmail.com`,
  password: bcrypt.hashSync('Aa12345!!', 10),
  verificationLevel: VerificationLevel.INTERESTS_ADDED,
  verificationCode: faker.datatype.number({ min: 100000, max: 999999 }),
};

export default async function seedPublishers(prisma: PrismaClient) {
  console.log('Seeding users (publishers)');

  const users = new Array(15).fill(1).map(() => {
    const gender = faker.random.arrayElement(['male', 'female']);
    const name = faker.company.companyName(0);
    const userName = name.toLowerCase().replace(/\W|_/g, '');
    const avatar =
      gender === 'female'
        ? faker.random.arrayElement(['user1', 'user2'])
        : faker.random.arrayElement(['user3', 'user4']);

    const password = faker.internet.password(8, true);
    const passwordHash = bcrypt.hashSync(password, 10);

    return {
      avatar,
      userName,
      name,
      password: passwordHash,
      email: `${userName.toLowerCase()}gmail.com`,
      verificationLevel: VerificationLevel.INTERESTS_ADDED,
      verificationCode: faker.datatype.number({ min: 100000, max: 999999 }),
    } as User;
  });

  const extendedUsers = [publisher, ...users];

  for (const user of extendedUsers) {
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
