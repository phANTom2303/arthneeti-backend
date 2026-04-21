import pool from "#config/db.js";
import { getRedisClient } from "#config/redis.js";
import { CacheKeys } from "#utils/cache-keys.js";
import { logger } from "#config/logger.js";

/**
 * Initializes a dedicated database connection to listen for Postgres NOTIFY events.
 */
export async function setupDbListeners() {
    // 1. Check out a dedicated client from the pool
    const client = await pool.connect();
    const redisClient = getRedisClient();

    try {
        // 2. Subscribe to the Postgres channels we defined in the triggers
        await client.query('LISTEN new_ai_verdict');
        await client.query('LISTEN new_agent_report');

        logger.info('Database LISTEN/NOTIFY initialized for Cache Invalidation');

        // 3. Handle incoming notifications
        client.on('notification', async (msg) => {
            try {
                if (msg.channel === 'new_ai_verdict') {
                    const company_symbol = msg.payload;
                    const cacheKey = CacheKeys.AI_VERDICT.latest_decision(company_symbol);
                    
                    // Invalidate the Redis cache for this specific stock
                    await redisClient.del(cacheKey);
                    logger.info(`[Cache Cleared] AI Verdict for ${company_symbol}`);
                }
            } catch (err) {
                logger.error('Error invalidating cache from DB notification:', err);
            }
        });

    } catch (err) {
        logger.error('Failed to setup DB listeners:', err);
        client.release(); // Return client to pool if setup fails
    }

    // 4. Handle connection drops (important for long-running listeners)
    client.on('error', (err) => {
        logger.error('Postgres listener client error:', err);
        // If the connection drops, it's often best to let the process crash 
        // so your process manager (PM2, Docker, etc.) restarts it cleanly.
        process.exit(-1); 
    });
}