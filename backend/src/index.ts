import { Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';
import winston from 'winston';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';

// Import logger
import logger from './middleware/logger.middleware';

// Import middleware
import { authenticateToken } from './middleware/auth.middleware';
import { requestLogger, requestIdMiddleware } from './middleware/logger.middleware';
import {
  validateEnvironment,
  requestSizeLimit,
  enforceHTTPS
} from './middleware/validation.middleware';
import { timeout, TIMEOUTS } from './middleware/timeout.middleware';

// Import Redis for health check
import redisConfig from './config/redis';

// Services
import { AvailabilityService } from './domains/availability/availability.service';
import { BookingService } from './domains/booking/booking.service';
import { PricingService } from './domains/pricing/pricing.service';
import { AIService } from './domains/ai/ai.service';

import { emailService } from './services/EmailService';

// Routes
import userDetailsRoutes from './routes/userDetails';
import authRoutes from './routes/auth.routes';
import userAuthRoutes from './routes/user.auth.routes';
import contentRoutes from './routes/content.routes';
import enquiriesRoutes from './routes/enquiries.routes';
import studiosRoutes from './routes/studios.routes';
import projectsRoutes from './routes/projects.routes';
import bookingsAdminRoutes from './routes/bookings.admin.routes';
import uploadRoutes from './routes/upload.routes';
import goldenHourRoutes from './routes/goldenHour.routes';

dotenv.config();

// Validate environment on startup (CRITICAL)
try {
  validateEnvironment();
} catch (error) {
  console.error('❌ Environment validation failed:', error);
  process.exit(1);
}

const app = express();

// Trust proxy for rate limiting (Render uses proxy)
app.set('trust proxy', 1);

// ============ SECURITY MIDDLEWARE ============

// 1. Helmet - sets various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://res.cloudinary.com"],
    },
  } : false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// 2. Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use(enforceHTTPS);
}

// 3. Request ID for tracing
app.use(requestIdMiddleware);

// 4. Request logging
app.use(requestLogger);

// 5. Rate limiting - stricter for auth, lenient for public
const isDev = process.env.NODE_ENV !== 'production';

const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 100,
  message: { error: 'Too many requests from this IP, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev, // skip entirely in development
});

const authRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 10000 : 5,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev, // skip entirely in development
});

// 6. Request size limit (10MB max)
app.use(requestSizeLimit);

// 7. CORS - whitelist only configured frontend URLs
const corsOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url: string) => url.trim().replace(/\/$/, ''))
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Normalize requested origin (strip trailing slash if any)
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    if (corsOrigins.indexOf(normalizedOrigin) !== -1 || isDev) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-Response-Time'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// 8. Compression
app.use(compression());

// 9. Request timeout - prevents hanging requests
app.use(timeout(TIMEOUTS.GENERAL));

// 10. Cookie parser - must be before auth routes to read cookies
app.use(cookieParser());

// 11. Body parser with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Services initialization
const availabilityService = new AvailabilityService();
const bookingService = new BookingService();
const pricingService = new PricingService();
const aiService = new AIService();

// --- Public Routes ---

// Enhanced Health Check (no rate limit)
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: 'unknown',
        redis: 'unknown',
      }
    };

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.checks.database = 'healthy';
    } catch (dbError) {
      health.checks.database = 'unhealthy';
      health.status = 'degraded';
      logger.error('Health check - Database error:', { error: dbError });
    }

    // Check Redis connection (if configured)
    try {
      const ping = await redisConfig.ping();
      health.checks.redis = ping === 'PONG' ? 'healthy' : 'unhealthy';
      if (ping !== 'PONG') {
        health.status = 'degraded';
      }
    } catch (redisError) {
      // Redis is optional, mark as not configured if connection fails
      health.checks.redis = 'not_configured';
      logger.warn('Health check - Redis not available:', { error: redisError.message });
    }

    const httpStatus = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    res.status(httpStatus).json(health);

  } catch (error) {
    logger.error('Health check failed:', { error });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// User Details Routes (public booking, rate limited)
app.use('/api/user-details', generalRateLimit, userDetailsRoutes);

// User Auth Routes (for customers - no password required for now)
app.use('/api/users', generalRateLimit, userAuthRoutes);

// Admin Auth Routes (rate limited, stricter)
app.use('/api/auth', authRateLimit, authRoutes);

// --- Admin Routes (PROTECTED - Authentication Required) ---

// All admin routes require authentication
// Content GET is public (website reads it), PUT requires admin auth
app.use('/api/content', generalRateLimit, contentRoutes);

// Enquiries - GET public (contact form submissions visible), mutations require auth
app.use('/api/enquiries', generalRateLimit, enquiriesRoutes);

// Studios (public endpoints, auth applied selectively in route file)
app.use('/api/studios', generalRateLimit, studiosRoutes);

// Projects (public endpoints, auth applied selectively in route file)
app.use('/api/projects', generalRateLimit, projectsRoutes);

// Admin Bookings
app.use('/api/admin/bookings', authenticateToken, generalRateLimit, bookingsAdminRoutes);

// Golden Hour Sets management
app.use('/api/golden-hour', generalRateLimit, goldenHourRoutes);

// Image Upload (admin only — auth applied in route)
app.use('/api/upload', generalRateLimit, uploadRoutes);

// --- Original Booking Routes (Keep for compatibility) ---

// Availability check (free ranges) — no cache (real-time)
app.get('/api/availability', async (req: Request, res: Response) => {
  try {
    const { studio_id, start_date, end_date } = req.query;
    if (!studio_id || !start_date || !end_date) {
      res.status(400).json({ error: 'Missing parameters' });
      return;
    }
    const slots = await availabilityService.getAvailability(
      String(studio_id),
      new Date(String(start_date)),
      new Date(String(end_date))
    );
    res.json({ available_slots: slots });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Discrete bookable slots for a specific date + duration — NO CACHE (real-time, reflects locks)
app.get('/api/availability/slots', async (req: Request, res: Response) => {
  try {
    const { studio_id, date, duration_hours } = req.query;
    if (!studio_id || !date || !duration_hours) {
      return res.status(400).json({ error: 'studio_id, date, duration_hours required' });
    }

    const durationHours = Number(duration_hours);
    const dayStart = new Date(String(date));
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    // Get free ranges for this day (already accounts for existing bookings, locks, and operations)
    const freeRanges = await availabilityService.getAvailability(
      String(studio_id), dayStart, dayEnd
    );

    // 1. Determine Operating Hours for this day to generate the full visual grid
    const dayOfWeek = dayStart.getDay();
    const studio = await prisma.studio.findFirst({
        where: { OR: [{ id: String(studio_id) }, { slug: String(studio_id) }] },
        include: { availability_rules: true }
    });

    let operatingStart = new Date(dayStart);
    operatingStart.setHours(9, 0, 0, 0); // Fallback 9 AM
    let operatingEnd = new Date(dayStart);
    operatingEnd.setHours(22, 0, 0, 0); // Fallback 10 PM

    if (studio) {
        const rule = studio.availability_rules.find(r => r.day_of_week === dayOfWeek && r.is_active);
        if (rule) {
            const parseTime = (timeStr: string) => {
               const [h, m] = timeStr.split(':').map(Number);
               const d = new Date(dayStart);
               d.setHours(h, m, 0, 0);
               return d;
            };
            operatingStart = parseTime(rule.start_time);
            operatingEnd = parseTime(rule.end_time);
            if (rule.end_time === '00:00' || rule.end_time === '24:00' || rule.end_time === '00:00:00') {
                 operatingEnd = new Date(dayStart);
                 operatingEnd.setHours(23, 59, 59, 999);
            }
        }
    }

    // 2. Generate all slots starting from the operating boundaries, moving in 1 hour increments
    const slotRanges: { start: Date; end: Date; is_available: boolean }[] = [];
    let currentSlotStart = new Date(operatingStart);

    while (currentSlotStart < operatingEnd) {
        const currentSlotEnd = new Date(currentSlotStart.getTime() + durationHours * 60 * 60 * 1000);
        
        // If this potential slot spills over the operating hours, stop generating.
        if (currentSlotEnd > operatingEnd) break;

        let isAvailable = false;
        // Check if [currentSlotStart, currentSlotEnd] perfectly fits inside any freeRange
        for (const fr of freeRanges) {
            const frStart = new Date(fr.start);
            const frEnd = new Date(fr.end);
            if (currentSlotStart >= frStart && currentSlotEnd <= frEnd) {
                isAvailable = true;
                break; // Found a large enough gap!
            }
        }

        slotRanges.push({ start: new Date(currentSlotStart), end: new Date(currentSlotEnd), is_available: isAvailable });
        
        // Advance cursor by 1 hour (so they can book 4-hours starting at 9, 10, or 11)
        currentSlotStart = new Date(currentSlotStart.getTime() + 60 * 60 * 1000);
    }

    // 3. Batch price calculations ONLY for available slots (saves heavy processing)
    const priceResults = await Promise.all(
      slotRanges.map(({ start, end, is_available }) =>
        is_available 
          ? pricingService.calculatePrice(String(studio_id), start, end).catch(() => null)
          : Promise.resolve(null)
      )
    );

    const slots = [];
    for (let i = 0; i < slotRanges.length; i++) {
      const { start, end, is_available } = slotRanges[i];
      const priceData = priceResults[i];
      slots.push({
        start: start.toISOString(),
        end: end.toISOString(),
        price: priceData?.total ?? 0,
        currency: priceData?.currency ?? 'INR',
        is_available // <-- Now exposing the lock status mapped directly to the slot
      });
    }

    return res.json({ slots, date: String(date), duration_hours: durationHours });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create booking hold
app.post('/api/bookings/hold', async (req: Request, res: Response) => {
  try {
    const { studio_id, start_datetime, end_datetime } = req.body;
    const startDate = new Date(start_datetime);
    const endDate = new Date(end_datetime);

    const price = await pricingService.calculatePrice(studio_id, startDate, endDate);
    const lock = await bookingService.createHold(studio_id, startDate, endDate);

    // Invalidate availability cache for this studio so other users see updated slots immediately
    invalidateCache(`/api/availability*`);

    res.json({ ...lock, pricing_preview: price });
  } catch (error: any) {
    res.status(409).json({ error: error.message });
  }
});

// Confirm booking (supports both authenticated users and guests)
app.post('/api/bookings/confirm', async (req: Request, res: Response) => {
  try {
    const { lock_token, payment_intent_id, final_price, user_details } = req.body;

    // Extract user ID from JWT if authenticated, otherwise null (guest booking)
    const userId = (req as any).user?.userId || null;

    console.log('Booking confirm request:', {
      lock_token: lock_token ? `${lock_token.substring(0, 8)}...` : 'missing',
      payment_intent_id,
      final_price,
      user_details: {
        full_name: user_details?.full_name,
        email: user_details?.email,
        phone: user_details?.phone
      },
      userId: userId || 'guest'
    });

    const booking = await bookingService.confirmBooking(
      lock_token,
      userId,
      user_details,
      payment_intent_id,
      final_price
    );

    // Fetch studio name for email
    const studioForEmail = await prisma.studio.findUnique({ where: { id: booking.studio_id } });

    // Send emails after booking confirmed — to user + admin
    try {
      const emailData = {
        bookingId: booking.id,
        confirmationCode: booking.id.substring(0, 8).toUpperCase(),
        studioName: studioForEmail?.name || 'Studio',
        date: booking.start_datetime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        startTime: booking.start_datetime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        endTime: booking.end_datetime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        duration: `${Math.round((booking.end_datetime.getTime() - booking.start_datetime.getTime()) / (1000 * 60 * 60))} hours`,
        totalAmount: Number(booking.total_price),
        userDetails: {
          fullName: user_details?.full_name || 'Guest',
          email: user_details?.email || '',
          phone: user_details?.phone || '',
          company: user_details?.company,
          specialRequirements: user_details?.special_requirements,
        },
      };
      Promise.all([
        emailService.sendBookingConfirmation(emailData),
        emailService.sendAdminBookingNotification(emailData),
      ]).catch(e => console.error('Email error (non-critical):', e));
    } catch (emailErr) {
      console.error('Email setup failed (non-critical):', emailErr);
    }

    res.json({ booking_id: booking.id, status: 'CONFIRMED', email_status: booking.email_status });
  } catch (error: any) {
    console.error('Booking confirmation error:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(400).json({ error: error.message });
  }
});

// AI Chat
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    const response = await aiService.getCreativeAdvice(message);
    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Swagger API Documentation
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Qala Studios API',
    version: '1.0.0',
    description: 'API for Qala Studios booking and admin management',
    contact: {
      name: 'Qala Studios',
      email: 'info@qalastudios.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3001}`,
      description: 'Development server',
    },
    {
      url: process.env.NODE_ENV === 'production' ? 'https://qalastudio.onrender.com' : undefined,
      description: 'Production server',
    },
  ].filter(Boolean),
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [],
};

// Swagger options
const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/routes/**/*.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(options);

// Serve Swagger docs at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Qala Studios API Docs',
}));

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const requestId = (_req as any).requestId || 'unknown';

  // Log error with Winston
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    requestId,
    path: _req.path,
    method: _req.method
  });

  // Don't expose stack traces in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const errorMessage = isDevelopment && err.stack ? err.stack : 'Something went wrong!';

  res.status(500).json({
    error: isDevelopment ? err.message : 'Something went wrong!',
    ...(isDevelopment && { stack: err.stack }),
    requestId
  });
});

const PORT = process.env.PORT || 3001;

// Export app for testing
export default app;

// Import and start lock cleanup job
import { startLockCleanupJob } from './utils/lockCleanup';
import { startCacheCleanup, cacheMiddleware, invalidateCache } from './middleware/cache.middleware';
import { startKeepAlive } from './utils/keepAlive';
import prisma from './config/db';

let cleanupJobTimer: NodeJS.Timeout | null = null;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Frontend should be at http://localhost:5173`);
  try {
    cleanupJobTimer = startLockCleanupJob();
    startCacheCleanup();
    startKeepAlive();
    logger.info('Server started successfully', { port: PORT, environment: process.env.NODE_ENV });
  } catch (error) {
    console.error('Failed to start cleanup job:', error);
    logger.error('Cleanup job failed to start', { error });
  }
});

// Graceful shutdown handler
process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);
process.on('SIGQUIT', handleShutdown);

async function handleShutdown(signal: string) {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  // Stop accepting new requests
  // (Express doesn't have built-in way, but we can set a flag)

  // Stop the cleanup job
  if (cleanupJobTimer) {
    clearInterval(cleanupJobTimer);
    logger.info('Stopped lock cleanup job');
  }

  // Close database connection
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error disconnecting from database', { error });
  }

  logger.info('Graceful shutdown complete');
  process.exit(0);
}
