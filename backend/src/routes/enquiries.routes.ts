import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /enquiries:
 *   get:
 *     summary: Get all enquiries
 *     description: Retrieve customer enquiries with optional filtering (admin only)
 *     tags: [Enquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, READ, REPLIED, CLOSED, SPAM]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of enquiries with pagination
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '50' } = req.query as any;
    const statusStr: string = Array.isArray(status) ? status[0] : (status as string) ?? '';
    const where = statusStr ? { status: statusStr.toUpperCase() as any } : {};

    const enquiries = await prisma.enquiry.findMany({
      where,
      orderBy: { submitted_at: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.enquiry.count({ where });

    return res.json({
      enquiries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
});

/**
 * @swagger
 * /enquiries/{id}:
 *   get:
 *     summary: Get enquiry by ID
 *     description: Retrieve a single enquiry by ID (admin only)
 *     tags: [Enquiries]
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
 *         description: Enquiry details
 *       404:
 *         description: Enquiry not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const idRaw = req.params.id;
    const id = Array.isArray(idRaw) ? idRaw[0] : (idRaw as string);
    const enquiry = await prisma.enquiry.findUnique({
      where: { id }
    });

    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    return res.json(enquiry);
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    return res.status(500).json({ error: 'Failed to fetch enquiry' });
  }
});

/**
 * @swagger
 * /enquiries/{id}/status:
 *   put:
 *     summary: Update enquiry status
 *     description: Update the status of an enquiry (admin only)
 *     tags: [Enquiries]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [NEW, READ, REPLIED, CLOSED, SPAM]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const idRaw = req.params.id;
    const id = Array.isArray(idRaw) ? idRaw[0] : (idRaw as string);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const statusUpper = typeof status === 'string' ? status.toUpperCase() : status;
    const validStatuses = ['NEW', 'READ', 'REPLIED', 'CLOSED', 'SPAM'];

    if (!validStatuses.includes(statusUpper)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: { status: statusUpper as any, updated_at: new Date() }
    });

    return res.json({ success: true, enquiry });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    return res.status(500).json({ error: 'Failed to update enquiry' });
  }
});

/**
 * @swagger
 * /enquiries/{id}:
 *   delete:
 *     summary: Delete enquiry
 *     description: Delete an enquiry (admin only)
 *     tags: [Enquiries]
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
 *         description: Enquiry deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const idRaw = req.params.id;
    const id = Array.isArray(idRaw) ? idRaw[0] : (idRaw as string);
    await prisma.enquiry.delete({
      where: { id }
    });

    return res.json({ success: true, message: 'Enquiry deleted' });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    return res.status(500).json({ error: 'Failed to delete enquiry' });
  }
});

// Public POST — anyone can submit an enquiry from the contact form
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const missing = [];
    if (!name) missing.push('name');
    if (!email) missing.push('email');
    if (!phone) missing.push('phone');
    if (!subject) missing.push('subject');
    if (!message) missing.push('message');
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }
    const enquiry = await prisma.enquiry.create({
      data: { name, email, phone, subject, message, status: 'NEW' }
    });
    return res.json({ success: true, enquiry });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    return res.status(500).json({ error: 'Failed to submit enquiry' });
  }
});

export default router;
