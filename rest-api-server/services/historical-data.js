import pool from "#config/db.js";
import { getRedisClient } from "#config/redis.js";
import axios from 'axios';
import { NotFoundError } from "#lib/errors.js";
import { CacheKeys, CACHE_TTL } from "#utils/cache-keys.js";

const UPSTOX_BASE_URL = process.env.UPSTOX_BASE_URL;

class HistoricalData {
    
    static async fetchHistoricalData({ symbol, startDate, endDate, interval = 'day' }) {
        const symbolUpper = symbol.toUpperCase();
        const redisClient = getRedisClient();
        const cacheKey = CacheKeys.UPSTOX.instrument_key(symbolUpper);
        let instrumentKey;

        // 1. Check Redis 
        const cachedKey = await redisClient.get(cacheKey);

        if (cachedKey) {
            instrumentKey = cachedKey;
        } else {
            
            const companyResult = await pool.query(
                `SELECT instrument_key FROM companies WHERE symbol = $1`,
                [symbolUpper]
            );

            if (companyResult.rows.length === 0) {
                throw new NotFoundError(`Company symbol ${symbolUpper} not found in database.`);
            }

            instrumentKey = companyResult.rows[0].instrument_key;

            // Update Redis so next request is faster
            await redisClient.setEx(cacheKey, CACHE_TTL.ONE_DAY, instrumentKey);
        }

        // 3. Dynamic Interval Mapping for Upstox V3
        // This ensures "3M" or "1D" buttons work by mapping frontend strings to Upstox units
        let apiUnit = 'days';
        let apiInterval = '1';

        switch (interval.toLowerCase()) {
            case '1minute':
            case '1m':
                apiUnit = 'minutes';
                apiInterval = '1';
                break;
            case '30minute':
            case '30m':
                apiUnit = 'minutes';
                apiInterval = '30';
                break;
            case 'day':
            case '1d':
            default:
                apiUnit = 'days';
                apiInterval = '1';
        }

        // 4. Construct the precise V3 URL
        const url = `${UPSTOX_BASE_URL}/${instrumentKey}/${apiUnit}/${apiInterval}/${endDate}/${startDate}`;

        // 5. Fetch data from Upstox
        const response = await axios.get(url, {
            headers: { 
                'Accept': 'application/json'
            }
        });

        return response.data;
    }
}

export default HistoricalData;