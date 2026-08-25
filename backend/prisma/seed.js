/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment',
  'Education', 'Health', 'Travel', 'Subscriptions', 'Rent', 'Other',
];

async function main() {
  const passwordHash = await bcrypt.hash('Demo@1234', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@financetracker.app' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@financetracker.app',
      passwordHash,
      monthlyBudget: 40000,
    },
  });

  for (const name of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { userId_name: { userId: user.id, name } },
      update: {},
      create: { userId: user.id, name, isDefault: true },
    });
  }

  console.log(`Seeded demo user: ${user.email} / password: Demo@1234`);
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
