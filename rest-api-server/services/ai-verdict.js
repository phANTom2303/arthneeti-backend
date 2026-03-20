import pool from "#config/db.js";
import { getRedisClient } from "#config/redis.js";
import { CacheKeys, CACHE_TTL } from "#utils/cache-keys.js";
class AI_Verdict {
    static async hydrateRedisWithLatestDecisions() {
        const redisClient = getRedisClient();

        console.log("Hydrating Redis with latest AI Verdicts...");

        const query = `
                SELECT DISTINCT ON (company_symbol) company_symbol, trade_date, decision, analysis_id 
                FROM final_trading_decisions 
                ORDER BY company_symbol, trade_date DESC;
            `;
        const result = await pool.query(query);

        const pipeline = redisClient.multi();

        for (const row of result.rows) {

            const cacheKey = CacheKeys.AI_VERDICT.latest_decision(row.company_symbol);
            pipeline.set(cacheKey, JSON.stringify(row), { EX: CACHE_TTL.ONE_DAY });
        }

        await pipeline.exec();
        console.log(`Successfully hydrated ${result.rowCount} company verdicts.`);
        return;
    }
    static async getLatestVerdict(company_symbol) {
        const query =
            `
        SELECT company_symbol, trade_date, decision, analysis_id 
        FROM final_trading_decisions 
        WHERE company_symbol=$1
        ORDER BY trade_date DESC
        LIMIT 1;
        `;

        const result = await pool.query(query, [company_symbol]);

        return result.rows[0];
    }

    static async getReportsByAnalysisID(analysis_id) {
        const query =
            `
        SELECT agent_name, report_date, report
        FROM agent_reports
        WHERE analysis_id=$1
        `;

        const result = await pool.query(query, [analysis_id]);

        return result.rows;
    }
}

export default AI_Verdict;