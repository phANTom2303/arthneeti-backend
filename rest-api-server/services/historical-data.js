import axios from 'axios';
import Companies from "#api/services/companies.js";


const UPSTOX_BASE_URL = process.env.UPSTOX_BASE_URL;

class HistoricalData {
    
    static async fetchHistoricalData({ symbol, startDate, endDate }) {

        const instrumentKey = await Companies.getInstrumentKey(symbol);
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Calculate difference in days
        const diffInMs = Math.abs(end - start);//difference in millisecs
        const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24)); 

        let apiUnit = 'days';
        let apiInterval = '1';

        if (diffInDays <= 2) {
            apiUnit = 'minutes';
            apiInterval = '1';  // Intraday view
        } else if (diffInDays > 2 && diffInDays <= 31) {
            apiUnit = 'minutes';
            apiInterval = '30'; // Monthly view
        } else if (diffInDays > 31 && diffInDays <= 365) {
            apiUnit = 'days';
            apiInterval = '1';  // Yearly view
        } else if (diffInDays > 365 && diffInDays <= 1095) {
            apiUnit = 'weeks';
            apiInterval = '1';  // 3-Year view
        } else {
            apiUnit = 'months';
            apiInterval = '1'; // 3+ Year view
        }

        // 3. Construct URL and Fetch
        const url = `${UPSTOX_BASE_URL}/${instrumentKey}/${apiUnit}/${apiInterval}/${endDate}/${startDate}`;

        const response = await axios.get(url, {
            headers: { 'Accept': 'application/json' }
        });

        return response.data;
    }
}

export default HistoricalData;