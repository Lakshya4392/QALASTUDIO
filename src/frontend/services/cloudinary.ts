/**
 * Cloudinary URL optimizer.
 * Injects transformation params into any Cloudinary secure_url.
 * Falls back to the original URL for non-Cloudinary sources.
 */

interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'avif';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  gravity?: 'auto' | 'face' | 'center';
}

const CLOUDINARY_UPLOAD_RE = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/)?(.+)$/;

export function optimizeCloudinaryUrl(url: string, opts: CloudinaryOptions = {}): string {
  if (!url) return url;

  const match = url.match(CLOUDINARY_UPLOAD_RE);
  if (!match) return url; // Not a Cloudinary URL — return as-is

  const [, base, version, path] = match;

  const transforms: string[] = ['f_auto', 'q_auto'];
  if (opts.width) transforms.push(`w_${opts.width}`);
  if (opts.height) transforms.push(`h_${opts.height}`);
  if (opts.crop) transforms.push(`c_${opts.crop}`);
  if (opts.gravity) transforms.push(`g_${opts.gravity}`);

  const t = transforms.join(',');
  return `${base}${t}/${version ?? ''}${path}`;
}

/**
 * Returns a srcSet string for responsive images.
 * widths: array of pixel widths to generate (e.g. [400, 800, 1200])
 */
export function cloudinarySrcSet(url: string, widths: number[]): string {
  if (!url || !CLOUDINARY_UPLOAD_RE.test(url)) return '';
  return widths
    .map(w => `${optimizeCloudinaryUrl(url, { width: w, crop: 'fill', gravity: 'auto' })} ${w}w`)
    .join(', ');
}
