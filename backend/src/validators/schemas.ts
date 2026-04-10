import { z } from 'zod';

export const goldenHourSetSchema = z.object({
  name: z.string().min(2),
  category: z.string(),
  theme: z.string(),
  description: z.string().optional(),
  // Accept string or number for price (form sends string)
  price: z.union([z.string(), z.number()]).optional().nullable().transform(v => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  }),
  price_note: z.string().optional().nullable(),
  image_url: z.union([z.string().url(), z.literal('')]).optional().nullable().transform(v => v === '' ? null : v),
  bts_video: z.union([z.string().url(), z.literal('')]).optional().nullable().transform(v => v === '' ? null : v),
  dimensions: z.string().optional().nullable(),
  props: z.array(z.string()).optional(),
  coords_x: z.number().int().min(0).max(2000),
  coords_y: z.number().int().min(0).max(2000),
  coords_w: z.number().int().min(0).max(2000),
  coords_h: z.number().int().min(0).max(2000),
  is_active: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const studioSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  // Accept string or number for price
  price: z.union([z.string(), z.number()]).optional().nullable().transform(v => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(String(v).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? null : n;
  }),
  price_note: z.string().optional().nullable(),
  image_url: z.union([z.string().url(), z.literal('')]).optional().nullable().transform(v => v === '' ? null : v),
  is_active: z.boolean().optional(),
  order: z.number().int().optional(),
  features: z.array(z.string()).optional(),
  min_booking_duration_minutes: z.number().int().optional(),
  max_booking_duration_hours: z.number().int().optional(),
});

export const projectSchema = z.object({
  type: z.string(),
  brand: z.string(),
  name: z.string(),
  year: z.string(),
  category: z.array(z.string()).optional(),
  media_url: z.union([z.string().url(), z.literal('')]).transform(v => v === '' ? 'https://placeholder.com' : v),
  thumbnail: z.union([z.string().url(), z.literal('')]).optional().nullable().transform(v => v === '' ? null : v),
  is_active: z.boolean().optional(),
  order: z.number().int().optional(),
});
