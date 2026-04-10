import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middleware/auth.middleware';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.middleware';
import { goldenHourSetSchema } from '../validators/schemas';

const router = Router();

/**
 * @swagger
 * /golden-hour:
 *   get:
 *     summary: Get all golden hour sets
 *     description: Retrieve list of all golden hour sets
 *     tags: [GoldenHour]
 */
router.get('/', cacheMiddleware(60), async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active === 'true';
    const where = activeOnly ? { is_active: true } : {};
    
    const sets = await prisma.goldenHourSet.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    return res.json(sets);
  } catch (error) {
    console.error('Error fetching golden hour sets:', error);
    return res.status(500).json({ error: 'Failed to fetch sets' });
  }
});

/**
 * @swagger
 * /golden-hour:
 *   post:
 *     summary: Create golden hour set
 *     tags: [GoldenHour]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validatedData = goldenHourSetSchema.parse(req.body);
    
    const set = await prisma.goldenHourSet.create({
      data: validatedData
    });

    invalidateCache('/api/golden-hour*');
    return res.json({ success: true, set });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error creating golden hour set:', error);
    return res.status(500).json({ error: 'Failed to create set' });
  }
});

/**
 * @swagger
 * /golden-hour/{id}:
 *   put:
 *     summary: Update golden hour set
 *     tags: [GoldenHour]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = goldenHourSetSchema.partial().parse(req.body);

    const set = await prisma.goldenHourSet.update({
      where: { id },
      data: validatedData
    });

    invalidateCache('/api/golden-hour*');
    return res.json({ success: true, set });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error updating golden hour set:', error);
    return res.status(500).json({ error: 'Failed to update set' });
  }
});

/**
 * @swagger
 * /golden-hour/{id}:
 *   delete:
 *     summary: Delete golden hour set
 *     tags: [GoldenHour]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.goldenHourSet.delete({
      where: { id }
    });

    invalidateCache('/api/golden-hour*');
    return res.json({ success: true, message: 'Set deleted' });
  } catch (error) {
    console.error('Error deleting golden hour set:', error);
    return res.status(500).json({ error: 'Failed to delete set' });
  }
});

/**
 * @swagger
 * /golden-hour/{id}/toggle:
 *   post:
 *     summary: Toggle golden hour set active status
 *     tags: [GoldenHour]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/toggle', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.goldenHourSet.findUnique({ where: { id } });
    
    if (!existing) return res.status(404).json({ error: 'Set not found' });

    const updated = await prisma.goldenHourSet.update({
      where: { id },
      data: { is_active: !existing.is_active }
    });

    invalidateCache('/api/golden-hour*');
    return res.json({ success: true, set: updated });
  } catch (error) {
    console.error('Error toggling set:', error);
    return res.status(500).json({ error: 'Failed to toggle set' });
  }
});

export default router;
