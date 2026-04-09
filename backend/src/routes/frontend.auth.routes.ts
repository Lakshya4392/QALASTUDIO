import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1),
  role: z.enum(['CUSTOMER', 'STUDIO_OWNER', 'ADMIN', 'SUPER_ADMIN', 'GUEST']).optional().default('CUSTOMER'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

const profileSchema = z.object({
  full_name: z.string().min(1).optional(),
  phone: z.string().min(3).optional(),
});

function requireJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not set');
  }
  return secret;
}

function mapRoleToDb(role: string) {
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') return 'ADMIN' as const;
  if (role === 'CUSTOMER' || role === 'STUDIO_OWNER') return 'CUSTOMER' as const;
  return 'GUEST' as const;
}

function buildFrontendUser(params: { userId: string; email: string; role: string; fullName: string; phone?: string | null }) {
  return {
    id: params.userId,
    email: params.email,
    role: params.role,
    full_name: params.fullName,
    phone: params.phone || undefined,
    email_verified: false,
    two_factor_enabled: false,
  };
}

function getBearerToken(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  return token || null;
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, role, phone } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const dbRole = mapRoleToDb(role);

    const user = await prisma.user.create({
      data: {
        email,
        phone: phone || null,
        password_hash: passwordHash,
        role: dbRole,
      },
    });

    await prisma.userDetails.create({
      data: {
        full_name,
        email,
        phone: phone || '',
      },
    });

    const secret = requireJwtSecret();
    const access_token = jwt.sign({ userId: user.id, email: user.email, role: dbRole }, secret, { expiresIn: '7d' } as any);
    const refresh_token = jwt.sign({ userId: user.id, type: 'refresh' }, secret, { expiresIn: '30d' } as any);

    return res.json({
      data: {
        access_token,
        refresh_token,
        user: buildFrontendUser({ userId: user.id, email: user.email, role: dbRole, fullName: full_name, phone: phone || null }),
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', details: err.issues });
    }
    return res.status(500).json({ message: err?.message || 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password_hash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const details = await prisma.userDetails.findFirst({
      where: { email: user.email },
      orderBy: { created_at: 'desc' },
    });

    const secret = requireJwtSecret();
    const access_token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' } as any);
    const refresh_token = jwt.sign({ userId: user.id, type: 'refresh' }, secret, { expiresIn: '30d' } as any);

    return res.json({
      data: {
        access_token,
        refresh_token,
        user: buildFrontendUser({
          userId: user.id,
          email: user.email,
          role: user.role,
          fullName: details?.full_name || user.email.split('@')[0],
          phone: user.phone,
        }),
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', details: err.issues });
    }
    return res.status(500).json({ message: err?.message || 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const secret = requireJwtSecret();
    const decoded = jwt.verify(token, secret) as any;

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ message: 'Not authenticated' });

    const details = await prisma.userDetails.findFirst({
      where: { email: user.email },
      orderBy: { created_at: 'desc' },
    });

    return res.json({
      data: buildFrontendUser({
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: details?.full_name || user.email.split('@')[0],
        phone: user.phone,
      }),
    });
  } catch (err: any) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// PUT /api/auth/profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const secret = requireJwtSecret();
    const decoded = jwt.verify(token, secret) as any;
    const { full_name, phone } = profileSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ message: 'Not authenticated' });

    if (phone !== undefined) {
      await prisma.user.update({ where: { id: user.id }, data: { phone } });
    }

    if (full_name !== undefined || phone !== undefined) {
      const existingDetails = await prisma.userDetails.findFirst({
        where: { email: user.email },
        orderBy: { created_at: 'desc' },
      });

      await prisma.userDetails.create({
        data: {
          full_name: full_name ?? existingDetails?.full_name ?? user.email.split('@')[0],
          email: user.email,
          phone: phone ?? existingDetails?.phone ?? user.phone ?? '',
        },
      });
    }

    const details = await prisma.userDetails.findFirst({
      where: { email: user.email },
      orderBy: { created_at: 'desc' },
    });

    return res.json({
      data: buildFrontendUser({
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: details?.full_name || user.email.split('@')[0],
        phone: phone ?? user.phone,
      }),
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', details: err.issues });
    }
    return res.status(500).json({ message: err?.message || 'Failed to update profile' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refresh_token } = refreshSchema.parse(req.body);
    const secret = requireJwtSecret();
    const decoded = jwt.verify(refresh_token, secret) as any;
    if (decoded.type !== 'refresh') return res.status(401).json({ message: 'Invalid refresh token' });

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

    const details = await prisma.userDetails.findFirst({
      where: { email: user.email },
      orderBy: { created_at: 'desc' },
    });

    const access_token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' } as any);

    return res.json({
      data: {
        access_token,
        user: buildFrontendUser({
          userId: user.id,
          email: user.email,
          role: user.role,
          fullName: details?.full_name || user.email.split('@')[0],
          phone: user.phone,
        }),
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', details: err.issues });
    }
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (_req: Request, res: Response) => {
  return res.json({ success: true });
});

// GET /api/auth/admin/users (simple admin helper for dashboard)
router.get('/admin/users', async (req: Request, res: Response) => {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const secret = requireJwtSecret();
    const decoded = jwt.verify(token, secret) as any;
    if (decoded.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

    const users = await prisma.user.findMany({ orderBy: { created_at: 'desc' }, take: 500 });
    return res.json({ data: users.map(u => ({ id: u.id, email: u.email, role: u.role, phone: u.phone })) });
  } catch (err: any) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
});

export default router;

