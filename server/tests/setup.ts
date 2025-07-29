import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.component.deleteMany();
  await prisma.page.deleteMany();
  await prisma.section.deleteMany();
  await prisma.notebook.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
