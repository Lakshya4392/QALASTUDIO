import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  full_name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().min(10).max(50),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new customer user
 *     description: Create a new user account for booking
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               full_name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Registration successful }
 *       400: { description: Invalid input or email already exists }
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone, password } = registerSchema.parse(req.body);

    // Check if user already exists
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password_hash: passwordHash,
        role: 'CUSTOMER',
      },
    });

    // Create initial UserDetails
    await prisma.userDetails.create({
      data: {
        full_name,
        email,
        phone,
      },
    });

    // Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Server config error' });

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn } as any
    );

    // Set httpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('user_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login customer user
 *     description: Authenticate customer and receive JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash || '');
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Server config error' });

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn } as any
    );

    // Set httpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('user_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Clears the user auth cookie
 *     tags: [Authentication]
 *     responses:
 *       200: { description: Logged out }
 */
router.post('/logout', (_req: Request, res: Response) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('user_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
  return res.json({ success: true, message: 'Logged out' });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns logged in user data and their bookings
 *     tags: [Authentication]
 *     responses:
 *       200: { description: User profile }
 *       401: { description: Not authenticated }
 */
/**
 * @swagger
 * /users/my-bookings:
 *   get:
 *     summary: Get user's bookings by email (public lookup)
 *     description: Retrieve all bookings for a given email address. Useful for guests to find their bookings without an account.
 *     tags: [Users]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bookings found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: No bookings found
 */
router.get('/my-bookings', async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'No bookings found for this email' });
    }

    // Fetch bookings for this user (including user_details)
    const bookings = await prisma.booking.findMany({
      where: { user_id: user.id },
      include: {
        studio: true,
        user_details: true,
      },
      orderBy: { created_at: 'desc' },
    });

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'No bookings found for this email' });
    }

    // Format response similar to admin bookings but limited to this user
    const formattedBookings = bookings.map(b => ({
      id: b.id,
      studioId: b.studio_id,
      studioName: b.studio?.name || 'Unknown Studio',
      date: b.start_datetime.toISOString().split('T')[0],
      startTime: b.start_datetime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      endTime: b.end_datetime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      duration: `${Math.round((b.end_datetime.getTime() - b.start_datetime.getTime()) / (1000 * 60 * 60))} hours`,
      totalAmount: Number(b.total_price),
      status: b.status,
      confirmationCode: b.id.substring(0, 8).toUpperCase(),
      userDetails: {
        name: b.user_details?.full_name || 'N/A',
        email: b.user_details?.email || 'N/A',
        phone: b.user_details?.phone || 'N/A',
      },
      bookedAt: b.created_at.toISOString(),
    }));

    return res.json({ bookings: formattedBookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  try {
    let token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && (req as any).cookies) {
      token = (req as any).cookies.user_token;
    }
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Server config error' });

    try {
      const decoded = jwt.verify(token, secret) as any;
      const userId = decoded.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          bookings: {
            include: {
              studio: true,
              user_details: true,
            },
            orderBy: { created_at: 'desc' },
            take: 20,
          },
        },
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      const bookings = user.bookings.map(b => ({
        id: b.id,
        studioName: b.studio?.name || 'Unknown Studio',
        date: b.start_datetime.toISOString().split('T')[0],
        startTime: b.start_datetime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        endTime: b.end_datetime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        duration: `${Math.round((b.end_datetime.getTime() - b.start_datetime.getTime()) / (1000 * 60 * 60))} hours`,
        totalAmount: Number(b.total_price),
        status: b.status,
        confirmationCode: b.id.substring(0, 8).toUpperCase(),
        specialRequirements: b.user_details?.special_requirements || null,
        bookedAt: b.created_at.toISOString(),
      }));

      // Get latest UserDetails for profile
      const latestUserDetails = await prisma.userDetails.findFirst({
        where: { email: user.email },
        orderBy: { created_at: 'desc' },
      });

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fullName: latestUserDetails?.full_name || null,
        },
        bookings,
      });
    } catch (jwtErr) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth /me error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// User cancel their own booking
router.post('/bookings/:id/cancel', async (req: Request, res: Response) => {
  try {
    let token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && (req as any).cookies) token = (req as any).cookies.user_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as any;
    const userId = decoded.userId;

    const idRaw = req.params.id;
    const id = Array.isArray(idRaw) ? idRaw[0] : idRaw as string;

    // Verify booking belongs to this user
    const booking = await prisma.booking.findFirst({
      where: { id, user_id: userId }
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'CANCELLED') return res.status(400).json({ error: 'Already cancelled' });
    if (booking.status === 'COMPLETED') return res.status(400).json({ error: 'Cannot cancel a completed booking' });

    await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED', updated_at: new Date() }
    });

    return res.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router;
