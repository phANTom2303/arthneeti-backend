import pool from "#config/db.js";

class Companies {
    /**
     * Fetches all companies from the database.
     * @returns {Promise<Array>} A promise that resolves to an array of all companies.
     * @example
     * const companies = await Companies.getAllCompanies();
     * console.log(companies);
     */
    static async getAllCompanies() {
        const query = `
            SELECT * FROM companies;
        `;

        const result = await pool.query(query);
        return result.rows;
    }
}

export default Companies;
