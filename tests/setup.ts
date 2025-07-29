import { PrismaClient } from '@prisma/client';

// Create a test database client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./test.db'
    }
  }
});

// Clean up database before and after tests
beforeEach(async () => {
  // Clean up all tables in the correct order (reverse of creation)
  await prisma.component.deleteMany();
  await prisma.page.deleteMany();
  await prisma.section.deleteMany();
  await prisma.notebook.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Make prisma available globally in tests
(global as any).prisma = prisma;