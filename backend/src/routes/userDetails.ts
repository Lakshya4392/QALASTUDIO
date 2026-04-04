import { Router, Request, Response } from 'express';
import { UserDetails } from '../models/UserDetails';
import prisma from '../config/db';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes (no authentication required)
/**
 * @swagger
 * /user-details/validate:
 *   post:
 *     summary: Validate user details
 *     description: Validate user details without storing them
 *     tags: [User Details]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *               specialRequirements:
 *                 type: string
 *     responses:
 *       200:
 *         description: Validation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 sanitized:
 *                   type: object
 *       400:
 *         description: Validation failed
 *     security: []
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const userDetails = new UserDetails(req.body);
    const validation = userDetails.validate();

    if (validation.isValid) {
      return res.json({
        valid: true,
        sanitized: userDetails.sanitize()
      });
    } else {
      return res.status(400).json({
        valid: false,
        errors: validation.errors
      });
    }
  } catch (error) {
    return res.status(500).json({
      valid: false,
      error: 'Validation failed'
    });
  }
});

/**
 * @swagger
 * /user-details/{bookingId}:
 *   get:
 *     summary: Get user details for booking (owner or admin only)
 *     description: Retrieve user details associated with a booking. User can only access their own bookings.
 *     tags: [User Details]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookingId:
 *                   type: string
 *                 userDetails:
 *                   type: object
 *       404:
 *         description: Booking not found
 *       403:
 *         description: Not authorized to view this booking
 */
router.get('/:bookingId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const bookingIdRaw = req.params.bookingId;
    const bookingId = Array.isArray(bookingIdRaw) ? bookingIdRaw[0] : (bookingIdRaw as string);

    // Get booking with user_id
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { user_id: true, user_details: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Authorization: user can only access their own booking
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && booking.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this booking' });
    }

    return res.json({
      bookingId: bookingId,
      userDetails: booking.user_details
    });
  } catch (error) {
    console.error('Error retrieving user details:', error);
    return res.status(500).json({ error: 'Failed to retrieve user details' });
  }
});

export default router;