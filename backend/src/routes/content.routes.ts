import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middleware/auth.middleware';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.middleware';

const router = Router();

const defaultServicesContent = {
  headerTitle: 'PRODUCTION SERVICES',
  headerSubtitle: 'Everything you need from pre-production to wrap.',
  sections: [
    {
      key: 'Equipment',
      title: 'Equipment Rental',
      subtitle: '',
      description:
        "Qala Studios houses Punjab's most extensive inventory of high-end camera, lighting, and grip equipment. Our on-site department ensures your technical needs are met with precision.",
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200',
      layout: 'image-left'
    },
    {
      key: 'Digital',
      title: 'Digital Services',
      subtitle: '',
      description:
        'Capture your vision with our top-tier digital support. We provide calibrated workstations, high-speed data management, and on-site digital technicians for seamless workflow from sensor to server.',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200',
      layout: 'image-right'
    },
    {
      key: 'VFX',
      title: 'VFX Magic',
      subtitle: 'Where Imagination Meets Reality.',
      description:
        'Our in-house VFX experts convert your wildest concepts into pixel-perfect reality, from chroma keying to 3D environment integration.',
      image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=1200',
      layout: 'image-left'
    },
    {
      key: 'Drone',
      title: 'Drone Shoot & Aerial Cinematography',
      subtitle: 'New Heights, New Perspectives.',
      description:
        'Capture the bigger picture with certified drone pilots delivering 4K HDR aerial shots and fast-paced FPV maneuvers.',
      image: 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?auto=format&fit=crop&q=80&w=1200',
      layout: 'image-right'
    },
    {
      key: 'Locations',
      title: 'Location Scouting',
      subtitle: '',
      description:
        'Beyond our dedicated studios, we offer location scouting and production vehicle support for shoots across Punjab.',
      image: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=1200',
      layout: 'image-left'
    }
  ]
};

const defaultAboutContent = {
  eyebrow: 'The Minds Behind',
  headingLine1: 'MEET THE MINDS',
  headingLine2: 'BEHIND THE MAGIC',
  members: [
    {
      name: 'Mudit Sharma',
      role: 'THE DRIVING FORCE',
      quote:
        "Founder. Visionary. Petrolhead. Mudit doesn't just build studios; he builds ecosystems for creativity. His passion is the fuel that keeps Qala moving forward at 100mph.",
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1200',
      ghostName: 'MUDIT',
      footNote: 'Grew up in garage bands & garage startups',
      annotations: ["Can't live without!\nHis Car", 'FPV goggles on,\nworld off', 'Builder by day,\nDJ by night']
    },
    {
      name: 'Rishab',
      role: 'MASTER OF COMPOSITION',
      quote:
        "For most, Golden Hour is a time of day; for Rishab, it’s game time. Addicted to cinematic flair and perfect framing, he’s the one who turns a shot into a story.",
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=1200',
      ghostName: 'RISHAB',
      footNote: 'Uses Ctrl+Z more than anything!! • Style: Cinematic',
      annotations: ['Addicted to\ncomposition', 'Builder mindset', 'Fav time? golden hour']
    },
    {
      name: 'Parth',
      role: 'THE DOP & STORYTELLER',
      quote:
        'Seeing the world through a 16-35mm lens, Parth captures what others miss. He doesn’t just record footage; he crafts visual narratives that breathe life into every frame.',
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=1200',
      ghostName: 'PARTH',
      footNote: 'Shoots in 24fps but thinks 100 ideas per second',
      annotations: ['Go to lens:\n16-35mm', 'Dream location:\nLadakh', 'Sharp story telling']
    }
  ],
  manifestoHeading: 'QALA IS NOT JUST A SPACE; IT\'S A',
  manifestoHighlight: 'MOVEMENT',
  manifestoText: 'We are a team of misfits, artists, and gear-heads united by one goal: Your best shot.'
};

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
      if (contentType === 'SERVICES') {
        return res.json({
          id: 'default-services-content',
          type: 'SERVICES',
          data: defaultServicesContent,
          is_active: true
        });
      }
      if (contentType === 'ABOUT') {
        return res.json({
          id: 'default-about-content',
          type: 'ABOUT',
          data: defaultAboutContent,
          is_active: true
        });
      }
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
