import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { notebooksRouter } from '../src/routes/notebooks';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/notebooks', notebooksRouter);

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
  });

  describe('GET /api/notebooks', () => {
    it('should return empty array when no notebooks exist', async () => {
      const response = await request(app)
        .get('/api/notebooks')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });
});
