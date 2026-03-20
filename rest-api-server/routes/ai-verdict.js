import { Router } from "express";
import { getLatestVerdictHandler, getReportsByIdHandler } from "#api/controllers/ai-verdict.js";
import { validateUUIDParam } from "#middlewares/uuid-validator.js";
const aiVerdictRouter = Router();

aiVerdictRouter.get('/decision/:company_symbol', getLatestVerdictHandler);
aiVerdictRouter.get('/report/:analysis_id', validateUUIDParam('analysis_id'), getReportsByIdHandler);

export default aiVerdictRouter;
