import Companies from "#api/services/companies.js";
import asyncHandler from "#lib/routing/async-handler.js";
import { RESPONSE_CODES } from '#lib/common.js';

export const getAllCompaniesHandler = asyncHandler(async (req, res) => {
    const companies = await Companies.getAllCompanies();

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({ 
        success: true, 
        data: companies 
    });
});
