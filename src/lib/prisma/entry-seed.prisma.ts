import { faker } from '@faker-js/faker';
import { pickRandomItem } from '../../utils/functions/random-item.function';
import { prismaClient } from './client.prisma';
import { UserObjectAdmin } from '../../types/user';
//run command "npx prisma db seed" to generate 100 random entries

const generateRandomEntry = async (user: UserObjectAdmin) => {
  const statusOptions = ['public', 'private', 'deleted'];
  const strokeOptions = [
    'frontcrawl',
    'backcrawl',
    'breastroke',
    'butterfly',
    'general',
  ];
  const stageOptions = [
    'stage_1',
    'stage_2',
    'stage_3',
    'stage_4',
    'stage_5',
    'stage_6',
    'stage_7',
    'stage_7_plus',
    'adult',
    'preschool',
  ];

  const typeOptions = ['tip', 'exercise', 'lesson_plan'];

  return {
    user_id: user.id,
    title: faker.word.words(5),
    body: faker.lorem.paragraph(),
    author: user.user_name || 'anomalous_user',
    created_on: faker.date.past(),
    updated_on: faker.date.recent(),
    type: pickRandomItem(typeOptions),
    teaching_points: [
      faker.word.words(3),
      faker.word.words(3),
      faker.word.words(3),
    ],
    stroke: pickRandomItem(strokeOptions),
    stage: [pickRandomItem(stageOptions), pickRandomItem(stageOptions)],
    status: pickRandomItem(statusOptions),
  };
};

const generateEntries = async (count: number) => {
  const response = await prismaClient.user.findMany();
  const users = response.map((item) => {
    const { password, ...user } = item;
    return user;
  });
  const entries = [];
  for (let i = 0; i < count; i++) {
    const newEntry = await generateRandomEntry(pickRandomItem(users));
    entries.push(newEntry);
  }
  return entries;
};

const main = async () => {
  const randomEntries = await generateEntries(100);
  await prismaClient.entry.createMany({
    data: randomEntries,
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
