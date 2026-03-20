import AI_Verdict from "#api/services/ai-verdict.js";
import asyncHandler from "#lib/routing/async-handler.js"
import { NotFoundError, BadRequestError } from '#lib/errors.js';
import { RESPONSE_CODES } from '#lib/common.js';

export const getLatestVerdictHandler = asyncHandler(async (req, res) => {

    const { company_symbol } = req.params;

    if (!company_symbol) {
        throw new BadRequestError("Company Symbol Path Parameter is not found");
    }
    const verdict = await AI_Verdict.getLatestVerdict(company_symbol);

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({ success: true, data: verdict });
});


export const getReportsByIdHandler = asyncHandler(async (req, res) => {
    const { analysis_id } = req.params;

    if (!analysis_id) {
        throw new BadRequestError("Analysis ID Path Parameter is not found");
    }

    const reports = await AI_Verdict.getReportsByAnalysisID(analysis_id);

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({ success: true, data: reports });
});