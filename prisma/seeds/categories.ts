import { PrismaClient } from '@prisma/client';

const categories = [
  {
    name: 'Entertaiment',
    icon: 'music',
    subcategories: [
      { name: 'Music', icon: 'music' },
      { name: 'Movies', icon: 'video' },
      { name: 'Cooking', icon: 'restaurant' },
      { name: 'Pets', icon: 'pet' },
      { name: 'Fashion', icon: 'fashion' },
      { name: 'Night Out', icon: 'glass_martini' },
    ],
  },
  {
    name: 'Sports',
    icon: 'basketball',
    subcategories: [
      { name: 'Basketball', icon: 'basketball' },
      { name: 'Baseball', icon: 'baseball' },
      { name: 'Football', icon: 'football' },
      { name: 'Volleyball', icon: 'volleyball' },
      { name: 'Weights', icon: 'dumbbell' },
    ],
  },
  {
    name: 'Culture',
    icon: 'palette',
    subcategories: [
      { name: 'Art', icon: 'palette' },
      { name: 'Photos', icon: 'camera' },
      { name: 'Reading', icon: 'book_open' },
    ],
  },
  {
    name: 'Science',
    icon: 'flask',
    subcategories: [
      { name: 'Health', icon: 'heart_beat' },
      { name: 'Audition', icon: 'ear' },
      { name: 'Tec', icon: 'devices' },
    ],
  },
];

export default async function seedCategories(prisma: PrismaClient) {
  console.log('Seeding categories');

  for (const category of categories) {
    const { name, icon, subcategories } = category;
    const dbEntity = await prisma.category.create({
      data: { name, icon },
    });

    for (const sub of subcategories) {
      await prisma.category.create({
        data: {
          ...sub,
          parentId: dbEntity.id,
        },
      });
    }
  }
}
