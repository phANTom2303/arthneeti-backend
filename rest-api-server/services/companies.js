import pool from "#config/db.js";
import { getRedisClient } from "#config/redis.js";
import { CacheKeys, CACHE_TTL } from "#utils/cache-keys.js";
class Companies {
    /**
     * Fetches all companies from the database.
     * @returns {Promise<Array>} A promise that resolves to an array of all companies.
     * @example
     * const companies = await Companies.getAllCompanies();
     * console.log(companies);
     */
    static async getAllCompanies() {

        const redisClient = getRedisClient();
        const cacheKey = CacheKeys.COMPANIES.all;
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        }

        const query = `
            SELECT * FROM companies;
        `;
        const result = await pool.query(query);

        if (result.rows.length > 0) {
            await redisClient.set(
                cacheKey, 
                JSON.stringify(result.rows), 
                { EX: CACHE_TTL.ONE_DAY }
            );
        }

        return result.rows;
    }

    static async getInstrumentKey(symbol) {
        const symbolUpper = symbol.toUpperCase();
        const redisClient = getRedisClient();
        const cacheKey = CacheKeys.UPSTOX.instrument_key(symbolUpper);

        // 1. Try Cache
        const cachedKey = await redisClient.get(cacheKey);
        if (cachedKey) return cachedKey;

        // 2. Try Database
        const query = `SELECT instrument_key FROM companies WHERE symbol = $1`;
        const result = await pool.query(query, [symbolUpper]);

        if (result.rows.length === 0) {
            throw new NotFoundError(`Company symbol ${symbolUpper} not found in database.`);
        }

        const instrumentKey = result.rows[0].instrument_key;

        // 3. Save to Redis for next time
        await redisClient.setEx(cacheKey, CACHE_TTL.ONE_DAY, instrumentKey);

        return instrumentKey;
    }
}

export default Companies;
