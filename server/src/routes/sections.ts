import { Router } from 'express';
import { prisma } from '../db';
import { CreateSectionRequest } from '../types';

const router = Router();

// Get all sections for a notebook
router.get('/notebook/:notebookId', async (req, res) => {
  try {
    const { notebookId } = req.params;
    const sections = await prisma.section.findMany({
      where: { notebookId },
      include: {
        pages: true,
        sectionGroup: true
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Get a specific section
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const section = await prisma.section.findUnique({
      where: { id },
      include: {
        pages: true,
        sectionGroup: true,
        notebook: true
      }
    });

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ error: 'Failed to fetch section' });
  }
});

// Create a new section
router.post('/', async (req, res) => {
  try {
    const { title, notebookId, sectionGroupId }: CreateSectionRequest = req.body;

    if (!title || !notebookId) {
      return res.status(400).json({ error: 'Title and notebookId are required' });
    }

    const section = await prisma.section.create({
      data: {
        title,
        notebookId,
        sectionGroupId
      },
      include: {
        pages: true,
        sectionGroup: true
      }
    });

    res.status(201).json(section);
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// Update a section
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, sectionGroupId } = req.body;

    const section = await prisma.section.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(sectionGroupId !== undefined && { sectionGroupId })
      },
      include: {
        pages: true,
        sectionGroup: true
      }
    });

    res.json(section);
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// Delete a section
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.section.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

export default router;