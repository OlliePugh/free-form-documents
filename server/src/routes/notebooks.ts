import { Router } from 'express';
import { prisma } from '../db';
import { CreateNotebookRequest } from '../types';

const router = Router();

// Get all notebooks
router.get('/', async (req, res) => {
  try {
    const notebooks = await prisma.notebook.findMany({
      include: {
        sectionGroups: {
          include: {
            sections: {
              include: {
                pages: {
                  include: {
                    components: true
                  }
                }
              }
            }
          }
        },
        sections: {
          include: {
            pages: {
              include: {
                components: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notebooks);
  } catch (error) {
    console.error('Error fetching notebooks:', error);
    res.status(500).json({ error: 'Failed to fetch notebooks' });
  }
});

// Get a specific notebook
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notebook = await prisma.notebook.findUnique({
      where: { id },
      include: {
        sectionGroups: {
          include: {
            sections: {
              include: {
                pages: {
                  include: {
                    components: true
                  }
                }
              }
            }
          }
        },
        sections: {
          include: {
            pages: {
              include: {
                components: true
              }
            }
          }
        }
      }
    });

    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    res.json(notebook);
  } catch (error) {
    console.error('Error fetching notebook:', error);
    res.status(500).json({ error: 'Failed to fetch notebook' });
  }
});

// Create a new notebook
router.post('/', async (req, res) => {
  try {
    const { title, color }: CreateNotebookRequest = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const notebook = await prisma.notebook.create({
      data: {
        title,
        color: color || '#4F46E5'
      }
    });

    res.status(201).json(notebook);
  } catch (error) {
    console.error('Error creating notebook:', error);
    res.status(500).json({ error: 'Failed to create notebook' });
  }
});

// Update a notebook
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, color } = req.body;

    const notebook = await prisma.notebook.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(color && { color })
      }
    });

    res.json(notebook);
  } catch (error) {
    console.error('Error updating notebook:', error);
    res.status(500).json({ error: 'Failed to update notebook' });
  }
});

// Delete a notebook
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.notebook.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting notebook:', error);
    res.status(500).json({ error: 'Failed to delete notebook' });
  }
});

export default router;