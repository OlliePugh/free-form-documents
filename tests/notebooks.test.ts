import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { notebooksRouter } from '../src/routes/notebooks';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/notebooks', notebooksRouter);

const prisma = (global as any).prisma as PrismaClient;

describe('Notebooks API', () => {
  describe('POST /api/notebooks', () => {
    it('should create a new notebook', async () => {
      const notebookData = {
        title: 'Test Notebook',
        color: '#FF0000'
      };

      const response = await request(app)
        .post('/api/notebooks')
        .send(notebookData)
        .expect(201);

      expect(response.body).toMatchObject({
        title: 'Test Notebook',
        color: '#FF0000'
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        title: '', // Empty title
        color: '#FF0000'
      };

      await request(app)
        .post('/api/notebooks')
        .send(invalidData)
        .expect(400);
    });

    it('should use default color if not provided', async () => {
      const notebookData = {
        title: 'Test Notebook'
      };

      const response = await request(app)
        .post('/api/notebooks')
        .send(notebookData)
        .expect(201);

      expect(response.body.color).toBeDefined();
    });
  });

  describe('GET /api/notebooks', () => {
    it('should return empty array when no notebooks exist', async () => {
      const response = await request(app)
        .get('/api/notebooks')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all notebooks with sections and pages', async () => {
      // Create test data
      const notebook = await prisma.notebook.create({
        data: {
          title: 'Test Notebook',
          color: '#FF0000'
        }
      });

      const section = await prisma.section.create({
        data: {
          title: 'Test Section',
          notebookId: notebook.id
        }
      });

      const page = await prisma.page.create({
        data: {
          title: 'Test Page',
          sectionId: section.id
        }
      });

      const response = await request(app)
        .get('/api/notebooks')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        title: 'Test Notebook',
        color: '#FF0000'
      });
      expect(response.body[0].sections).toHaveLength(1);
      expect(response.body[0].sections[0].pages).toHaveLength(1);
    });
  });

  describe('GET /api/notebooks/:id', () => {
    it('should return a specific notebook with nested data', async () => {
      const notebook = await prisma.notebook.create({
        data: {
          title: 'Test Notebook',
          color: '#FF0000'
        }
      });

      const response = await request(app)
        .get(`/api/notebooks/${notebook.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: notebook.id,
        title: 'Test Notebook',
        color: '#FF0000'
      });
    });

    it('should return 404 for non-existent notebook', async () => {
      const response = await request(app)
        .get('/api/notebooks/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('Notebook not found');
    });
  });

  describe('PUT /api/notebooks/:id', () => {
    it('should update a notebook', async () => {
      const notebook = await prisma.notebook.create({
        data: {
          title: 'Original Title',
          color: '#FF0000'
        }
      });

      const updateData = {
        title: 'Updated Title',
        color: '#00FF00'
      };

      const response = await request(app)
        .put(`/api/notebooks/${notebook.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: notebook.id,
        title: 'Updated Title',
        color: '#00FF00'
      });
    });

    it('should return 404 for non-existent notebook', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      await request(app)
        .put('/api/notebooks/non-existent-id')
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/notebooks/:id', () => {
    it('should delete a notebook and all related data', async () => {
      const notebook = await prisma.notebook.create({
        data: {
          title: 'Test Notebook',
          color: '#FF0000'
        }
      });

      const section = await prisma.section.create({
        data: {
          title: 'Test Section',
          notebookId: notebook.id
        }
      });

      const page = await prisma.page.create({
        data: {
          title: 'Test Page',
          sectionId: section.id
        }
      });

      await request(app)
        .delete(`/api/notebooks/${notebook.id}`)
        .expect(204);

      // Verify the notebook and all related data is deleted
      const deletedNotebook = await prisma.notebook.findUnique({
        where: { id: notebook.id }
      });
      expect(deletedNotebook).toBeNull();

      const deletedSection = await prisma.section.findUnique({
        where: { id: section.id }
      });
      expect(deletedSection).toBeNull();

      const deletedPage = await prisma.page.findUnique({
        where: { id: page.id }
      });
      expect(deletedPage).toBeNull();
    });

    it('should return 404 for non-existent notebook', async () => {
      await request(app)
        .delete('/api/notebooks/non-existent-id')
        .expect(404);
    });
  });
});