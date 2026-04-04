import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { PricingService } from '../domains/pricing/pricing.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /studios:
 *   get:
 *     summary: Get all studios
 *     description: Retrieve list of all studios (public endpoint)
 *     tags: [Studios]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of studios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   slug:
 *                     type: string
 *                   tagline:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   is_active:
 *                     type: boolean
 *                   order:
 *                     type: integer
 *     security: []
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const activeParam = req.query.active;
    const active = activeParam === 'true';
    const where = active ? { is_active: true } : {};

    const studios = await prisma.studio.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    return res.json(studios);
  } catch (error) {
    console.error('Error fetching studios:', error);
    return res.status(500).json({ error: 'Failed to fetch studios' });
  }
});

/**
 * @swagger
 * /studios/{id}:
 *   get:
 *     summary: Get studio by ID or slug
 *     description: Retrieve a single studio with availability and pricing rules
 *     tags: [Studios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Studio ID or slug
 *     responses:
 *       200:
 *         description: Studio details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 slug:
 *                   type: string
 *                 availability_rules:
 *                   type: array
 *                 pricing_rules:
 *                   type: array
 *       404:
 *         description: Studio not found
 *     security: []
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id as string;
    const studio = await prisma.studio.findUnique({
      where: { id },
      include: {
        availability_rules: true,
        pricing_rules: true
      }
    });

    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    return res.json(studio);
  } catch (error) {
    console.error('Error fetching studio:', error);
    return res.status(500).json({ error: 'Failed to fetch studio' });
  }
});

/**
 * @swagger
 * /studios:
 *   post:
 *     summary: Create studio
 *     description: Create a new studio (admin only)
 *     tags: [Studios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               tagline:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               is_active:
 *                 type: boolean
 *               order:
 *                 type: integer
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Studio created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      name, slug, tagline, description, price, price_note, image_url,
      is_active = true, order = 0,
      min_booking_duration_minutes = 60, max_booking_duration_hours = 8,
      features = [],
    } = req.body;

    const studioSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const numericPrice = price ? parseFloat(String(price).replace(/[^0-9.]/g, '')) : 5000;

    const studio = await prisma.studio.create({
      data: {
        name, slug: studioSlug, tagline, description,
        price: numericPrice, price_note, image_url,
        is_active, order, min_booking_duration_minutes, max_booking_duration_hours, features,
        // Auto-create availability rules: open every day 8am-10pm
        availability_rules: {
          create: [0,1,2,3,4,5,6].map(day => ({
            day_of_week: day, start_time: '08:00', end_time: '22:00', is_active: true
          }))
        },
        // Auto-create hourly pricing rule from the price field
        pricing_rules: {
          create: [{
            rule_type: 'HOURLY',
            price: numericPrice,
            currency: 'INR',
            priority: 0
          }]
        }
      }
    });

    return res.json({ success: true, studio });
  } catch (error) {
    console.error('Error creating studio:', error);
    return res.status(500).json({ error: 'Failed to create studio' });
  }
});

/**
 * @swagger
 * /studios/{id}:
 *   put:
 *     summary: Update studio
 *     description: Update an existing studio (admin only)
 *     tags: [Studios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               tagline:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               is_active:
 *                 type: boolean
 *               order:
 *                 type: integer
 *               features:
 *                 type: array
 *     responses:
 *       200:
 *         description: Studio updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id as string;
    const {
      name,
      tagline,
      description,
      price,
      price_note,
      image_url,
      is_active,
      order,
      min_booking_duration_minutes,
      max_booking_duration_hours,
      features
    } = req.body;

    const numericPrice = price ? parseFloat(String(price).replace(/[^0-9.]/g, '')) : undefined;

    const studio = await prisma.studio.update({
      where: { id },
      data: {
        name, tagline, description,
        price: numericPrice,
        price_note, image_url, is_active, order,
        min_booking_duration_minutes, max_booking_duration_hours, features
      }
    });

    // If price changed, update the HOURLY pricing rule too
    if (numericPrice !== undefined) {
      const existingRule = await prisma.pricingRule.findFirst({
        where: { studio_id: id, rule_type: 'HOURLY' }
      });
      if (existingRule) {
        await prisma.pricingRule.update({
          where: { id: existingRule.id },
          data: { price: numericPrice }
        });
      } else {
        await prisma.pricingRule.create({
          data: { studio_id: id, rule_type: 'HOURLY', price: numericPrice, currency: 'INR', priority: 0 }
        });
      }
    }

    return res.json({ success: true, studio });
  } catch (error) {
    console.error('Error updating studio:', error);
    return res.status(500).json({ error: 'Failed to update studio' });
  }
});

/**
 * @swagger
 * /studios/{id}:
 *   delete:
 *     summary: Delete studio
 *     description: Delete a studio (admin only)
 *     tags: [Studios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Studio deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id as string;
    await prisma.studio.delete({
      where: { id }
    });

    return res.json({ success: true, message: 'Studio deleted' });
  } catch (error) {
    console.error('Error deleting studio:', error);
    return res.status(500).json({ error: 'Failed to delete studio' });
  }
});

/**
 * @swagger
 * /studios/{id}/toggle:
 *   post:
 *     summary: Toggle studio active status
 *     description: Toggle a studio's active/inactive status (admin only)
 *     tags: [Studios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Studio status toggled successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/toggle', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id as string;
    const studio = await prisma.studio.findUnique({
      where: { id }
    });

    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    const updated = await prisma.studio.update({
      where: { id },
      data: { is_active: !studio.is_active }
    });

    return res.json({ success: true, studio: updated });
  } catch (error) {
    console.error('Error toggling studio:', error);
    return res.status(500).json({ error: 'Failed to toggle studio' });
  }
});

/**
 * @swagger
 * /studios/{id}/price:
 *   get:
 *     summary: Calculate booking price
 *     description: Calculate the price for a given time range based on pricing rules
 *     tags: [Studios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_datetime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: end_datetime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Price calculation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                 currency:
 *                   type: string
 *                   example: USD
 *                 breakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Missing or invalid parameters
 *       404:
 *         description: Studio not found
 *     security: []
 */
router.get('/:id/price', async (req: Request, res: Response) => {
  try {
    const idOrSlug = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id as string;
    const { start_datetime, end_datetime } = req.query;

    if (!start_datetime || !end_datetime) {
      res.status(400).json({ error: 'start_datetime and end_datetime are required' });
      return;
    }

    // Resolve studio ID from slug if needed
    let studioId: string;
    if (idOrSlug.includes('-') && idOrSlug.length > 20) {
      // Likely a UUID
      studioId = idOrSlug;
    } else {
      // Likely a slug, find the studio
      const studio = await prisma.studio.findUnique({
        where: { slug: idOrSlug }
      });
      if (!studio) {
        return res.status(404).json({ error: 'Studio not found' });
      }
      studioId = studio.id;
    }

    const startDate = new Date(start_datetime as string);
    const endDate = new Date(end_datetime as string);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const pricingService = new PricingService();
    const price = await pricingService.calculatePrice(studioId, startDate, endDate);
    return res.json(price);
  } catch (error: any) {
    console.error('Error calculating price:', error);
    return res.status(500).json({ error: error.message || 'Failed to calculate price' });
  }
});

export default router;
