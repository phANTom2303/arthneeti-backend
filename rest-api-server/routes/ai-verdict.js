import { Router } from "express";
import { getLatestVerdictHandler, getReportsByIdHandler } from "#api/controllers/ai-verdict.js";

const aiVerdictRouter = Router();

aiVerdictRouter.get('/decision/:company_symbol', getLatestVerdictHandler);
aiVerdictRouter.get('/report/:analysis_id', getReportsByIdHandler);

export default aiVerdictRouter;
