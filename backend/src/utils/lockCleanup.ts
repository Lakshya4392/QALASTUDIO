import prisma from '../config/db';

/**
 * Cleanup expired booking locks.
 * This should be called periodically (e.g., on server startup, or via cron).
 */
export async function cleanupExpiredLocks(): Promise<number> {
    try {
        const result = await prisma.bookingLock.deleteMany({
            where: {
                expires_at: { lt: new Date() }
            }
        });

        if (result.count > 0) {
            console.log(`[Cleanup] Removed ${result.count} expired booking locks`);
        }
        return result.count;
    } catch (error) {
        console.error('[Cleanup] Failed to clean up locks:', error);
        return 0;
    }
}

/**
 * Start periodic cleanup interval (every 5 minutes)
 */
export function startLockCleanupJob(intervalMs: number = 5 * 60 * 1000): NodeJS.Timeout {
    console.log('[Cleanup] Starting expired lock cleanup job');

    // Run immediately on startup
    cleanupExpiredLocks();

    // Then run periodically
    return setInterval(cleanupExpiredLocks, intervalMs);
}
