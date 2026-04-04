import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { emailService } from '../services/EmailService';

const router = Router();

/**
 * @swagger
 * /admin/bookings:
 *   get:
 *     summary: Get all bookings (admin)
 *     description: Retrieve bookings with optional filters (admin only)
 *     tags: [Bookings - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending_payment, confirmed, cancelled, completed, no_show, hold, expired]
 *       - in: query
 *         name: studio_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of bookings with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const rawStatus = req.query.status;
    const rawStudioId = req.query.studio_id;
    const page = typeof req.query.page === 'string' ? req.query.page : '1';
    const limit = typeof req.query.limit === 'string' ? req.query.limit : '50';
    const status = Array.isArray(rawStatus) ? rawStatus[0] : (rawStatus as string | undefined);
    const studio_id = Array.isArray(rawStudioId) ? rawStudioId[0] : (rawStudioId as string | undefined);

    const where: any = {};
    if (status) where.status = status as any;
    if (studio_id) where.studio_id = studio_id;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        studio: true,
        user_details: true,
        payments: true
      },
      orderBy: { created_at: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.booking.count({ where });

    // Transform data for admin panel format
    const formattedBookings = bookings.map(b => ({
      id: b.id,
      studioId: b.studio_id,
      studioName: b.studio?.name || 'Unknown Studio',
      date: b.start_datetime.toISOString().split('T')[0],
      startTime: b.start_datetime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      duration: `${Math.round((b.end_datetime.getTime() - b.start_datetime.getTime()) / (1000 * 60 * 60))} hours`,
      userDetails: {
        name: b.user_details?.full_name || 'N/A',
        email: b.user_details?.email || 'N/A',
        phone: b.user_details?.phone || 'N/A'
      },
      totalAmount: Number(b.total_price),
      status: b.status.toLowerCase(),
      confirmationCode: b.id.substring(0, 8).toUpperCase(),
      bookedAt: b.created_at.toISOString()
    }));

    return res.json({
      bookings: formattedBookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/**
 * @swagger
 * /admin/bookings/{id}/status:
 *   put:
 *     summary: Update booking status
 *     description: Update the status of a booking (admin only)
 *     tags: [Bookings - Admin]
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
 *                 enum: [pending_payment, confirmed, cancelled, completed, no_show, hold, expired]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const idRaw = req.params.id;
    const id = Array.isArray(idRaw) ? idRaw[0] : (idRaw as string);
    const { status } = req.body;

    if (!status || !['pending_payment', 'confirmed', 'cancelled', 'completed', 'no_show', 'hold', 'expired'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: status.toUpperCase() as any, updated_at: new Date() },
      include: { studio: true, user_details: true }
    });

    // Send status update email to user
    if (booking.user_details?.email && ['CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status.toUpperCase())) {
      const emailData = {
        bookingId: booking.id,
        confirmationCode: booking.id.substring(0, 8).toUpperCase(),
        studioName: booking.studio?.name || 'Studio',
        date: booking.start_datetime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        startTime: booking.start_datetime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        endTime: booking.end_datetime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        duration: `${Math.round((booking.end_datetime.getTime() - booking.start_datetime.getTime()) / (1000 * 60 * 60))} hours`,
        totalAmount: Number(booking.total_price),
        userDetails: {
          fullName: booking.user_details.full_name,
          email: booking.user_details.email,
          phone: booking.user_details.phone,
        },
      };
      emailService.sendStatusUpdateEmail(emailData, status.toUpperCase()).catch(e => console.error('Status email error:', e));
    }

    return res.json({ success: true, booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ error: 'Failed to update booking' });
  }
});

/**
 * @swagger
 * /admin/bookings/{id}:
 *   delete:
 *     summary: Delete booking
 *     description: Delete a booking (admin only)
 *     tags: [Bookings - Admin]
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
 *         description: Booking deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const idRaw = req.params.id;
    const id = Array.isArray(idRaw) ? idRaw[0] : (idRaw as string);
    await prisma.booking.delete({
      where: { id }
    });

    return res.json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ error: 'Failed to delete booking' });
  }
});

/**
 * @swagger
 * /admin/bookings/stats/overview:
 *   get:
 *     summary: Get booking statistics
 *     description: Retrieve overview statistics for bookings (admin only)
 *     tags: [Bookings - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 confirmed:
 *                   type: integer
 *                 pending:
 *                   type: integer
 *                 cancelled:
 *                   type: integer
 *                 completed:
 *                   type: integer
 *                 totalRevenue:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/stats/overview', async (_req: Request, res: Response) => {
  try {
    const total = await prisma.booking.count();
    const confirmed = await prisma.booking.count({ where: { status: 'CONFIRMED' } });
    const pending = await prisma.booking.count({ where: { status: 'PENDING_PAYMENT' } });
    const cancelled = await prisma.booking.count({ where: { status: 'CANCELLED' } });
    const completed = await prisma.booking.count({ where: { status: 'COMPLETED' } });

    // Revenue
    const revenueResult = await prisma.booking.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { total_price: true }
    });

    const totalRevenue = Number(revenueResult._sum.total_price || 0);

    return res.json({
      total,
      confirmed,
      pending,
      cancelled,
      completed,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    console.error('Error details:', error.stack || error);
    if (error instanceof Error) console.error('Error message:', error.message);
    // Return error details in response for debugging
    return res.status(500).json({
      error: 'Failed to fetch stats',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
