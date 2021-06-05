import { PrismaClient } from '@prisma/client';

const categories = [
  { name: 'Music', icon: 'music' },
  { name: 'Movies', icon: 'video' },
  { name: 'Photos', icon: 'camera' },
  { name: 'Art', icon: 'palette' },
  { name: 'Science', icon: 'flask' },
  { name: 'Health', icon: 'heart_beat' },
  { name: 'Reading', icon: 'book_open' },
  { name: 'Cooking', icon: 'restaurant' },
  { name: 'Pets', icon: 'pet' },
  { name: 'Fashion', icon: 'fashion' },
  { name: 'Sports', icon: 'basketball' },
  { name: 'Night Out', icon: 'glass_martini' },
];

export default async function seedCategories(prisma: PrismaClient) {
  console.log('Seeding categories');

  await prisma.category.createMany({
    data: categories,
  });
}
