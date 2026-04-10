import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middleware/auth.middleware';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.middleware';
import { projectSchema } from '../validators/schemas';

const router = Router();

// Get all projects
router.get('/', cacheMiddleware(60), async (req: Request, res: Response) => {
  try {
    const activeParam = req.query.active;
    const active = activeParam === 'true';
    const where = active ? { is_active: true } : {};

    const projects = await prisma.project.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    return res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create project
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validatedData = projectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        type: validatedData.type,
        brand: validatedData.brand,
        name: validatedData.name,
        year: validatedData.year,
        category: validatedData.category || [],
        media_url: validatedData.media_url || 'https://placeholder.com/image.jpg',
        thumbnail: validatedData.thumbnail || null,
        is_active: validatedData.is_active ?? true,
        order: validatedData.order ?? 0,
      }
    });

    invalidateCache('/api/projects*');
    return res.json({ success: true, project });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error creating project:', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const validatedData = projectSchema.partial().parse(req.body);

    const project = await prisma.project.update({
      where: { id: String(id) },
      data: validatedData
    });

    invalidateCache('/api/projects*');
    return res.json({ success: true, project });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error updating project:', error);
    return res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.project.delete({
      where: { id: String(id) }
    });

    invalidateCache('/api/projects*');

    return res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Toggle basic active status
router.post('/:id/toggle', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const project = await prisma.project.findUnique({
      where: { id: String(id) }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updated = await prisma.project.update({
      where: { id: String(id) },
      data: { is_active: !project.is_active }
    });

    invalidateCache('/api/projects*');

    return res.json({ success: true, project: updated });
  } catch (error) {
    console.error('Error toggling project:', error);
    return res.status(500).json({ error: 'Failed to toggle project' });
  }
});

export default router;
