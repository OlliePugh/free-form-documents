import { prisma } from './db';

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.pageComponent.deleteMany();
  await prisma.page.deleteMany();
  await prisma.section.deleteMany();
  await prisma.sectionGroup.deleteMany();
  await prisma.notebook.deleteMany();

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

  // Create sections
  const section1 = await prisma.section.create({
    data: {
      title: 'Quick Notes',
      notebookId: notebook1.id
    }
  });

  const section2 = await prisma.section.create({
    data: {
      title: 'Meeting Notes',
      notebookId: notebook2.id
    }
  });

  const section3 = await prisma.section.create({
    data: {
      title: 'Ideas',
      notebookId: notebook1.id
    }
  });

  // Create pages
  const page1 = await prisma.page.create({
    data: {
      title: 'Welcome Page',
      sectionId: section1.id
    }
  });

  const page2 = await prisma.page.create({
    data: {
      title: 'Project Planning',
      sectionId: section2.id
    }
  });

  const page3 = await prisma.page.create({
    data: {
      title: 'Architecture Notes',
      sectionId: section2.id
    }
  });

  // Create sample components with proper zIndex values
  await prisma.pageComponent.create({
    data: {
      pageId: page1.id,
      type: 'TEXT',
      x: 50,
      y: 50,
      width: 400,
      height: 100,
      zIndex: 0,
      text: 'Welcome to OneNote Clone!\n\nThis is a collaborative note-taking application built with React, Node.js, and Yjs for real-time collaboration.'
    }
  });

  await prisma.pageComponent.create({
    data: {
      pageId: page1.id,
      type: 'TEXT',
      x: 50,
      y: 200,
      width: 350,
      height: 80,
      zIndex: 1,
      text: 'Try adding new components using the toolbar above!\n\n• Add text components\n• Upload images\n• Collaborate in real-time'
    }
  });

  await prisma.pageComponent.create({
    data: {
      pageId: page2.id,
      type: 'TEXT',
      x: 100,
      y: 100,
      width: 300,
      height: 120,
      zIndex: 0,
      text: 'Project Timeline\n\n□ Research phase\n□ Design mockups\n□ Development\n□ Testing\n□ Deployment'
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