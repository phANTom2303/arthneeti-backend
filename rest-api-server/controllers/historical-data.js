import HistoricalData from '#api/services/historical-data.js';// Import the class
import asyncHandler from '#lib/routing/async-handler.js';
import { BadRequestError } from '#lib/errors.js';
import { RESPONSE_CODES } from '#lib/common.js';

export const getHistoricalDataHandler = asyncHandler(async (req, res) => {

    const { company_symbol, start_date, end_date, interval } = req.query;

    if (!company_symbol || !start_date || !end_date) {
        throw new BadRequestError("Missing required parameters: company_symbol, start_date, and end_date.");
    }

    const historicalData = await HistoricalData.fetchHistoricalData({
        symbol: company_symbol,
        startDate: start_date,
        endDate: end_date,
        interval: interval || '1'
    });

    return res.status(RESPONSE_CODES.SUCCESS_CODE).json({ 
        success: true, 
        data: historicalData 
    });
});