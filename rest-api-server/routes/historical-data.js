import { Router } from "express";
import { getHistoricalDataHandler } from '../controllers/historical-data.js';

const historicalDataRouter = Router();

historicalDataRouter.get('/historical-data', getHistoricalDataHandler);

export default historicalDataRouter;

