import  pool  from "#config/db.js";
class AI_Verdict {
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

    static async getReportsByAnalysisID(analysis_id){
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