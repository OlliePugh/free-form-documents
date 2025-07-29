import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../db';
import { CreatePageComponentRequest, UpdatePageComponentRequest } from '../types';

const router = Router();

// Configure multer for image uploads
const upload = multer({ storage: multer.memoryStorage() });

// Get all components for a page
router.get('/page/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const components = await prisma.pageComponent.findMany({
      where: { pageId },
      orderBy: { zIndex: 'asc' }
    });
    
    // Parse shapeData JSON strings back to objects
    const parsedComponents = components.map(component => ({
      ...component,
      shapeData: component.shapeData ? JSON.parse(component.shapeData) : null
    }));
    
    res.json(parsedComponents);
  } catch (error) {
    console.error('Error fetching components:', error);
    res.status(500).json({ error: 'Failed to fetch components' });
  }
});

// Get a specific component
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const component = await prisma.pageComponent.findUnique({
      where: { id }
    });

    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }

    // Parse shapeData if it exists
    const parsedComponent = {
      ...component,
      shapeData: component.shapeData ? JSON.parse(component.shapeData) : null
    };

    res.json(parsedComponent);
  } catch (error) {
    console.error('Error fetching component:', error);
    res.status(500).json({ error: 'Failed to fetch component' });
  }
});

// Serve image data
router.get('/image/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const component = await prisma.pageComponent.findUnique({
      where: { id },
      select: { imageData: true, type: true }
    });

    if (!component || component.type !== 'IMAGE' || !component.imageData) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.set('Content-Type', 'image/jpeg'); // Default to JPEG, could be enhanced to detect type
    res.send(component.imageData);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// Create a new component
router.post('/', async (req, res) => {
  try {
    const { pageId, type, x, y, width, height, zIndex, text, shapeData }: CreatePageComponentRequest = req.body;

    if (!pageId || !type || x === undefined || y === undefined || width === undefined || height === undefined) {
      return res.status(400).json({ error: 'pageId, type, x, y, width, and height are required' });
    }

    const component = await prisma.pageComponent.create({
      data: {
        pageId,
        type,
        x,
        y,
        width,
        height,
        zIndex: zIndex || 0,
        text,
        shapeData: shapeData ? JSON.stringify(shapeData) : null
      }
    });

    // Parse shapeData back to object for response
    const parsedComponent = {
      ...component,
      shapeData: component.shapeData ? JSON.parse(component.shapeData) : null
    };

    res.status(201).json(parsedComponent);
  } catch (error) {
    console.error('Error creating component:', error);
    res.status(500).json({ error: 'Failed to create component' });
  }
});

// Upload image component
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { pageId, x, y, width, height, zIndex } = req.body;

    if (!pageId || x === undefined || y === undefined || width === undefined || height === undefined) {
      return res.status(400).json({ error: 'pageId, x, y, width, and height are required' });
    }

    const component = await prisma.pageComponent.create({
      data: {
        pageId,
        type: 'IMAGE',
        x: parseFloat(x),
        y: parseFloat(y),
        width: parseFloat(width),
        height: parseFloat(height),
        zIndex: parseInt(zIndex) || 0,
        imageData: req.file.buffer
      }
    });

    res.status(201).json(component);
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Update a component
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { x, y, width, height, zIndex, text, shapeData }: UpdatePageComponentRequest = req.body;

    const component = await prisma.pageComponent.update({
      where: { id },
      data: {
        ...(x !== undefined && { x }),
        ...(y !== undefined && { y }),
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
        ...(zIndex !== undefined && { zIndex }),
        ...(text !== undefined && { text }),
        ...(shapeData !== undefined && { shapeData: JSON.stringify(shapeData) })
      }
    });

    // Parse shapeData back to object for response
    const parsedComponent = {
      ...component,
      shapeData: component.shapeData ? JSON.parse(component.shapeData) : null
    };

    res.json(parsedComponent);
  } catch (error) {
    console.error('Error updating component:', error);
    res.status(500).json({ error: 'Failed to update component' });
  }
});

// Delete a component
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.pageComponent.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting component:', error);
    res.status(500).json({ error: 'Failed to delete component' });
  }
});

export default router;