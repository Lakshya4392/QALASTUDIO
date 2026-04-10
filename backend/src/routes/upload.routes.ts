import { Router, Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Memory storage — no disk writes
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

router.post(
  '/',
  authenticateToken,
  (req: Request, res: Response, next: NextFunction) => {
    // Run multer as middleware
    upload.single('image')(req as any, res as any, (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'File upload error' });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        return res.status(500).json({
          error: 'Cloudinary not configured',
          hint: 'Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to backend .env'
        });
      }

      // Configure here so dotenv is already loaded
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

      const folder = (req.query.folder as string) || 'qala-studios';

      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file!.buffer);
      });

      return res.json({ success: true, url: result.secure_url, public_id: result.public_id });
    } catch (error: any) {
      console.error('Cloudinary upload error:', error.message || error);
      return res.status(500).json({ error: error.message || 'Upload failed' });
    }
  }
);

// GET /api/upload/images?folder=qala-studios/services
// List all images in a specific folder (requires auth)
router.get('/images', authenticateToken, async (req: Request, res: Response) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({
        error: 'Cloudinary not configured',
        hint: 'Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to backend .env'
      });
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

    const folder = (req.query.folder as string) || 'qala-studios';

    // Use Cloudinary REST API to list resources
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.api
        .resources_by_asset_folder(folder, { resource_type: 'image', max_results: 100 })
        .then(resolve)
        .catch((err) => {
          // If folder doesn't exist yet, it's not a server error, just return empty list
          if (err.error?.http_code === 404 || err.message?.includes('Folder doesn\'t exist')) {
            resolve({ resources: [] });
          } else {
            reject(err);
          }
        });
    });

    const images = (result.resources || []).map((img: any) => ({
      url: img.secure_url,
      public_id: img.public_id,
      filename: img.public_id.split('/').pop() || img.public_id,
      created_at: img.created_at,
      format: img.format,
      width: img.width,
      height: img.height,
    }));

    return res.json({ success: true, images, folder });
  } catch (error: any) {
    console.error('Cloudinary list images error:', error.message || error);
    return res.status(500).json({ error: error.message || 'Failed to fetch images' });
  }
});

export default router;
