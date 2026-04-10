/**
 * Keep-alive ping for Render free tier.
 * Render spins down free services after 15 min of inactivity.
 * This pings the health endpoint every 14 minutes to prevent that.
 */
export function startKeepAlive(): NodeJS.Timeout | null {
  if (process.env.NODE_ENV !== 'production') {
    console.log('ℹ️  Keep-alive not started (dev mode)');
    return null;
  }

  // Hardcoded production URL as primary, env var as fallback
  const rawUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || 'qalastudio.onrender.com';

  // Ensure it has https:// prefix
  const backendUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

  const INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

  const ping = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/health`);
      console.log(`[keep-alive] ping → ${res.status}`);
    } catch (e: any) {
      console.warn('[keep-alive] ping failed:', e.message);
    }
  };

  // First ping after 1 minute
  setTimeout(ping, 60 * 1000);

  return setInterval(ping, INTERVAL_MS);
}
