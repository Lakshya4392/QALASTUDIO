import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middleware/auth.middleware';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.middleware';

const router = Router();

/**
 * @swagger
 * /content:
 *   get:
 *     summary: Get all content
 *     description: Retrieve all active content entries
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of content entries
 *       401:
 *         description: Unauthorized
 */
router.get('/', cacheMiddleware(120), async (_req: Request, res: Response) => {
  try {
    const contents = await prisma.content.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' }
    });
    return res.json(contents);
  } catch (error) {
    console.error('Error fetching content:', error);
    return res.status(500).json({ error: 'Failed to fetch content' });
  }
});

/**
 * @swagger
 * /content/{type}:
 *   get:
 *     summary: Get content by type
 *     description: Retrieve content by type (HERO, ABOUT, SERVICES, etc.)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [HERO, ABOUT, CONTACT, SERVICES, FOOTER, SEO]
 *     responses:
 *       200:
 *         description: Content entry
 *       404:
 *         description: Content not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:type', cacheMiddleware(120), async (req: Request, res: Response) => {
  try {
    const typeRaw = req.params.type;
    const type = Array.isArray(typeRaw) ? typeRaw[0] : typeRaw as string;
    const contentType = type.toUpperCase();
    const content = await prisma.content.findFirst({
      where: { type: contentType as any, is_active: true }
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    return res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return res.status(500).json({ error: 'Failed to fetch content' });
  }
});

/**
 * @swagger
 * /content/{type}:
 *   put:
 *     summary: Update or create content
 *     description: Update existing content or create new content for the given type
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [HERO, ABOUT, CONTACT, SERVICES, FOOTER, SEO]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Content updated/created successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 */
router.put('/:type', authenticateToken, async (req: Request, res: Response) => {
  try {
    const typeRaw = req.params.type;
    const type = Array.isArray(typeRaw) ? typeRaw[0] : (typeRaw as string);
    const { data } = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data' });
    }

    // Prevent double nesting — if data.data exists, unwrap it
    const actualData = (data.data && typeof data.data === 'object') ? data.data : data;
    const contentType = type.toUpperCase();

    // Try upsert with composite unique
    let content;
    try {
      content = await prisma.content.upsert({
        where: {
          type_is_active: {
            type: contentType as any,
            is_active: true
          }
        },
        update: {
          data: actualData,
          updated_at: new Date()
        },
        create: {
          type: contentType as any,
          data: actualData,
          is_active: true,
          version: 1
        }
      });
    } catch (_upsertError) {
      const existing = await prisma.content.findFirst({
        where: { type: contentType as any, is_active: true }
      });

      if (existing) {
        content = await prisma.content.update({
          where: { id: existing.id },
          data: { data: actualData, updated_at: new Date() }
        });
      } else {
        content = await prisma.content.create({
          data: {
            type: contentType as any,
            data: actualData,
            is_active: true,
            version: 1
          }
        });
      }
    }

    // Invalidate content cache after update
    invalidateCache('/api/content');
    invalidateCache('/api/content/');

    return res.json({ success: true, content });
  } catch (error) {
    console.error('Error updating content:', error);
    return res.status(500).json({ error: 'Failed to update content' });
  }
});

export default router;
