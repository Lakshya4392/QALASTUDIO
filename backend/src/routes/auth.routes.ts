import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate admin user and receive JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Admin username
 *               password:
 *                 type: string
 *                 description: Admin password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                     last_login:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *     security: []
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    // Find admin user
    const admin = await prisma.adminUser.findFirst({
      where: { username, is_active: true }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // This should never happen due to environment validation, but fail safely
      console.error('CRITICAL: JWT_SECRET not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { userId: admin.id, username: admin.username, role: admin.role },
      secret,
      { expiresIn } as any
    );

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { last_login: new Date() }
    });

    // Return admin data (exclude password_hash)
    const { password_hash, ...adminData } = admin;

    // Set httpOnly cookie for secure storage
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (match JWT expiry)
      path: '/',
    });

    return res.json({
      success: true,
      user: adminData
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.issues });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify JWT token
 *     description: Verify the validity of a JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Server error
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    // Try to get token from Authorization header first, then from cookie
    let token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && req.cookies) {
      token = req.cookies.auth_token;
    }
    if (!token) {
      return res.status(401).json({ valid: false });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ valid: false, error: 'Server configuration error' });
    }

    try {
      const decoded = jwt.verify(token, secret) as any;
      return res.json({ valid: true, user: decoded });
    } catch (err) {
      return res.status(401).json({ valid: false });
    }
  } catch (error) {
    return res.status(401).json({ valid: false });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout - clear auth cookie
 *     description: Clears the httpOnly auth cookie on client
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/logout', (_req: Request, res: Response) => {
  // Clear the auth cookie
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });

  return res.json({ success: true, message: 'Logged out' });
});

// Change password (admin only — requires current password)
router.post('/change-password', async (req: Request, res: Response) => {
  try {
    let token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && req.cookies) token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as any;

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Invalid input. New password must be at least 6 characters.' });
    }

    const admin = await prisma.adminUser.findUnique({ where: { id: decoded.userId } });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    const valid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.adminUser.update({ where: { id: admin.id }, data: { password_hash: newHash } });

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (e) {
    console.error('Change password error:', e);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
