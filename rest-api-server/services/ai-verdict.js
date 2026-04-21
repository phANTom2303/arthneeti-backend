import pool from "#config/db.js";
import { getRedisClient } from "#config/redis.js";
import { CacheKeys, CACHE_TTL } from "#utils/cache-keys.js";
import { logger } from "#config/logger.js";
import { NotFoundError } from "#lib/errors.js";
class AI_Verdict {
    /**
     * Retrieves the most recent AI trading verdict for a given company symbol.
     * Utilizes a read-through Redis cache to minimize database queries.
     * * @param {string} company_symbol - The NSE ticker symbol of the company (e.g., 'ETERNAL').
     * @returns {Promise<Object|undefined>} A promise that resolves to the verdict object containing 
     * company_symbol, trade_date, decision, and analysis_id, or undefined if no record exists.
     * @example
     * const verdict = await AI_Verdict.getLatestVerdict('ETERNAL');
     * if (verdict) console.log(`Decision: ${verdict.decision}`);
     */
    static async getLatestVerdict(company_symbol) {

        const redisClient = getRedisClient();
        const companySymbolCacheKey = CacheKeys.AI_VERDICT.latest_decision(company_symbol);
        const cachedData = await redisClient.get(companySymbolCacheKey);

        if (cachedData) {
            logger.info(`Returning Cached Verdict for${company_symbol}`);
            return JSON.parse(cachedData);
        }

        const query =
            `
        SELECT company_symbol, trade_date, decision, analysis_id 
        FROM final_trading_decisions 
        WHERE company_symbol=$1
        ORDER BY trade_date DESC
        LIMIT 1;
        `;

        const result = await pool.query(query, [company_symbol]);

        if (result.rowCount > 0) {
            await redisClient.set(companySymbolCacheKey, JSON.stringify(result.rows[0]), { EX: CACHE_TTL.ONE_DAY });
             logger.info(`Returning DB Verdict for${company_symbol}`);
            return result.rows[0];
        } else {
            throw new NotFoundError("No Verdict exists for requested Symbol")
        }

    }

    /**
     * Retrieves all agent reports associated with a specific analysis ID.
     * Utilizes a read-through Redis cache.
     * * @param {string} analysis_id - The unique identifier for the specific analysis run.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of report objects 
     * containing agent_name, report_date, and report. Returns an empty array if none exist.
     * @example
     * const reports = await AI_Verdict.getReportsByAnalysisID('uuid-1234');
     * reports.forEach(r => console.log(r.agent_name, r.report));
     */
    static async getReportsByAnalysisID(analysis_id) {
        const redisClient = getRedisClient();
        const analysiIdCacheKey = CacheKeys.AI_VERDICT.latest_reports(analysis_id);
        const cachedData = await redisClient.get(analysiIdCacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        }

        const query =
            `
        SELECT agent_name, report_date, report
        FROM agent_reports
        WHERE analysis_id=$1
        `;

        const result = await pool.query(query, [analysis_id]);
        if (result.rowCount > 0) {
            await redisClient.set(analysiIdCacheKey, JSON.stringify(result.rows), { EX: CACHE_TTL.ONE_DAY });
            return result.rows;
        } else {
            throw new NotFoundError("No Reports found for the requested analysis ID");
        }

    }
}

export default AI_Verdict;