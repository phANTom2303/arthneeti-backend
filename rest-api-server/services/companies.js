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
}

export default Companies;
