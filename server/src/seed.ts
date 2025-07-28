import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample notebooks
  const notebook1 = await prisma.notebook.create({
    data: {
      title: 'Personal Notes',
      color: '#4F46E5'
    }
  });

  const notebook2 = await prisma.notebook.create({
    data: {
      title: 'Work Projects',
      color: '#059669'
    }
  });

  // Create sections for Personal Notes
  const section1 = await prisma.section.create({
    data: {
      title: 'Ideas',
      notebookId: notebook1.id
    }
  });

  const section2 = await prisma.section.create({
    data: {
      title: 'Meeting Notes',
      notebookId: notebook1.id
    }
  });

  // Create sections for Work Projects
  const section3 = await prisma.section.create({
    data: {
      title: 'OneNote Clone',
      notebookId: notebook2.id
    }
  });

  // Create sample pages
  const page1 = await prisma.page.create({
    data: {
      title: 'App Ideas',
      sectionId: section1.id
    }
  });

  const page2 = await prisma.page.create({
    data: {
      title: 'Daily Standup - Jan 15',
      sectionId: section2.id
    }
  });

  const page3 = await prisma.page.create({
    data: {
      title: 'Project Architecture',
      sectionId: section3.id
    }
  });

  // Create sample components
  await prisma.pageComponent.create({
    data: {
      pageId: page1.id,
      type: 'TEXT',
      x: 100,
      y: 100,
      width: 300,
      height: 80,
      zIndex: 0,
      text: 'Build a collaborative note-taking app like OneNote'
    }
  });

  await prisma.pageComponent.create({
    data: {
      pageId: page1.id,
      type: 'TEXT',
      x: 100,
      y: 200,
      width: 250,
      height: 60,
      zIndex: 1,
      text: 'Features: Real-time sync, drag & drop, images'
    }
  });

  await prisma.pageComponent.create({
    data: {
      pageId: page2.id,
      type: 'TEXT',
      x: 50,
      y: 50,
      width: 400,
      height: 120,
      zIndex: 0,
      text: 'Daily Standup Notes\n\n• Completed API routes\n• Working on frontend\n• Next: Implement Yjs integration'
    }
  });

  await prisma.pageComponent.create({
    data: {
      pageId: page3.id,
      type: 'TEXT',
      x: 80,
      y: 80,
      width: 350,
      height: 150,
      zIndex: 0,
      text: 'Architecture Overview\n\nBackend:\n• Node.js + TypeScript\n• SQLite + Prisma\n• Hocuspocus for real-time\n\nFrontend:\n• React + TypeScript\n• Yjs for collaboration'
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log(`Created ${await prisma.notebook.count()} notebooks`);
  console.log(`Created ${await prisma.section.count()} sections`);
  console.log(`Created ${await prisma.page.count()} pages`);
  console.log(`Created ${await prisma.pageComponent.count()} components`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });