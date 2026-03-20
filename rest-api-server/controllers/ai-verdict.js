import AI_Verdict from "#api/services/ai-verdict.js";
import asyncHandler from "#lib/routing/async-handler.js"
import { RESPONSE_CODES } from '#lib/common.js';

export const getLatestVerdictHandler = asyncHandler(async (req, res) => {

    const { company_symbol } = req.params;
    const verdict = await AI_Verdict.getLatestVerdict(company_symbol);
    if (!verdict) {
        return res.status(RESPONSE_CODES.NOT_FOUND_ERROR_CODE).json({ success: false, message: "Verdict not found" });
    }

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({ success: true, data: verdict });
});


export const getReportsByIdHandler = asyncHandler(async (req, res) => {
    const { analysis_id } = req.params;
    const reports = await AI_Verdict.getReportsByAnalysisID(analysis_id);

    if (!reports) {
        return res.status(RESPONSE_CODES.NOT_FOUND_ERROR_CODE).json({ success: false, message: "Reports not found" });
    }

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({ success: true, data: reports });
});