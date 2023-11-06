import bcrypt from 'bcrypt';
import { prismaClient } from './client.prisma';
import { faker } from '@faker-js/faker';
import { UserRole, UserStatus } from '@prisma/client';
//run command "npx prisma db seed" to generate 100 random users

const pickRandomItem = (arr: string[]): string => {
  let randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
};

const generateRandomUser = async () => {
  const roleOptions = ['user', 'moderator', 'admin'];
  const statusOptions = [
    'active',
    'inactive',
    'muted',
    'banned',
    'deleted',
    'locked',
  ];

  const hash = await bcrypt.hash(faker.internet.password(), 12);

  return {
    name: faker.person.fullName(),
    user_name: faker.internet.userName(),
    email: faker.internet.email(),
    password: hash,
    role: pickRandomItem(roleOptions) as UserRole,
    status: pickRandomItem(statusOptions) as UserStatus,
    created_on: faker.date.past(),
    updated_on: faker.date.recent(),
    is_teacher: faker.datatype.boolean(),
    bio: faker.lorem.paragraph(),
    is_bio_public: faker.datatype.boolean(),
    moderator_notes: [...Array(faker.number.int({ min: 0, max: 5 }))].map(() =>
      faker.lorem.sentence()
    ),
  };
};

const generateUsers = async (count: number) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const newUser = await generateRandomUser();
    users.push(newUser);
  }
  return users;
};

const main = async () => {
  const randomUsers = await generateUsers(100);
  await prismaClient.user.createMany({
    data: randomUsers,
    skipDuplicates: true,
  });
};
main()
  .then(() => prismaClient.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });
