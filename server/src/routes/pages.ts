import { Router } from 'express';
import { prisma } from '../db';
import { CreatePageRequest } from '../types';

const router = Router();

// Get all pages for a section
router.get('/section/:sectionId', async (req, res) => {
  try {
    const { sectionId } = req.params;
    const pages = await prisma.page.findMany({
      where: { sectionId },
      include: {
        components: {
          orderBy: { zIndex: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// Get a specific page
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        components: {
          orderBy: { zIndex: 'asc' }
        },
        section: {
          include: {
            notebook: true
          }
        }
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

// Create a new page
router.post('/', async (req, res) => {
  try {
    const { title, sectionId }: CreatePageRequest = req.body;

    if (!title || !sectionId) {
      return res.status(400).json({ error: 'Title and sectionId are required' });
    }

    const page = await prisma.page.create({
      data: {
        title,
        sectionId
      },
      include: {
        components: true
      }
    });

    res.status(201).json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
});

// Update a page
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const page = await prisma.page.update({
      where: { id },
      data: { title },
      include: {
        components: {
          orderBy: { zIndex: 'asc' }
        }
      }
    });

    res.json(page);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

// Delete a page
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.page.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

export default router;