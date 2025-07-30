import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { pagesRouter } from '../src/routes/pages';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/pages', pagesRouter);

const prisma = (global as any).prisma as PrismaClient;

describe('Pages API', () => {
  let testNotebook: any;
  let testSection: any;

  beforeEach(async () => {
    // Create test notebook and section for each test
    testNotebook = await prisma.notebook.create({
      data: {
        title: 'Test Notebook',
        color: '#FF0000'
      }
    });

    testSection = await prisma.section.create({
      data: {
        title: 'Test Section',
        notebookId: testNotebook.id
      }
    });
  });

  describe('POST /api/pages', () => {
    it('should create a new page', async () => {
      const pageData = {
        title: 'Test Page',
        sectionId: testSection.id
      };

      const response = await request(app)
        .post('/api/pages')
        .send(pageData)
        .expect(201);

      expect(response.body).toMatchObject({
        title: 'Test Page',
        sectionId: testSection.id
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        title: '', // Empty title
        sectionId: testSection.id
      };

      await request(app)
        .post('/api/pages')
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for non-existent section', async () => {
      const pageData = {
        title: 'Test Page',
        sectionId: 'non-existent-section'
      };

      await request(app)
        .post('/api/pages')
        .send(pageData)
        .expect(400);
    });
  });

  describe('GET /api/pages/:id', () => {
    it('should return a specific page with nested data', async () => {
      const page = await prisma.page.create({
        data: {
          title: 'Test Page',
          sectionId: testSection.id
        }
      });

      const response = await request(app)
        .get(`/api/pages/${page.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: page.id,
        title: 'Test Page'
      });
      expect(response.body.section).toBeDefined();
      expect(response.body.section.notebook).toBeDefined();
      expect(response.body.components).toBeDefined();
    });

    it('should return 404 for non-existent page', async () => {
      const response = await request(app)
        .get('/api/pages/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Page not found');
    });
  });

  describe('PUT /api/pages/:id', () => {
    it('should update a page', async () => {
      const page = await prisma.page.create({
        data: {
          title: 'Original Title',
          sectionId: testSection.id
        }
      });

      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put(`/api/pages/${page.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: page.id,
        title: 'Updated Title'
      });
    });

    it('should return 404 for non-existent page', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      await request(app)
        .put('/api/pages/non-existent-id')
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/pages/:id', () => {
    it('should delete a page and all its components', async () => {
      const page = await prisma.page.create({
        data: {
          title: 'Test Page',
          sectionId: testSection.id
        }
      });

      const component = await prisma.component.create({
        data: {
          type: 'TEXT',
          x: 100,
          y: 100,
          width: 200,
          height: 100,
          zIndex: 1,
          pageId: page.id
        }
      });

      await request(app)
        .delete(`/api/pages/${page.id}`)
        .expect(204);

      // Verify the page and its components are deleted
      const deletedPage = await prisma.page.findUnique({
        where: { id: page.id }
      });
      expect(deletedPage).toBeNull();

      const deletedComponent = await prisma.component.findUnique({
        where: { id: component.id }
      });
      expect(deletedComponent).toBeNull();
    });

    it('should return 404 for non-existent page', async () => {
      await request(app)
        .delete('/api/pages/non-existent-id')
        .expect(404);
    });
  });

  describe('Page with components', () => {
    it('should include components when fetching a page', async () => {
      const page = await prisma.page.create({
        data: {
          title: 'Test Page with Components',
          sectionId: testSection.id
        }
      });

      await prisma.component.create({
        data: {
          type: 'TEXT',
          x: 100,
          y: 100,
          width: 200,
          height: 100,
          zIndex: 1,
          pageId: page.id
        }
      });

      await prisma.component.create({
        data: {
          type: 'IMAGE',
          x: 300,
          y: 200,
          width: 150,
          height: 150,
          zIndex: 2,
          pageId: page.id
        }
      });

      const response = await request(app)
        .get(`/api/pages/${page.id}`)
        .expect(200);

      expect(response.body.components).toHaveLength(2);
      expect(response.body.components[0].type).toBe('TEXT');
      expect(response.body.components[1].type).toBe('IMAGE');
    });
  });
});