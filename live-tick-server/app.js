import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';

import { logger } from '#config/logger.js';
import { RESPONSE_CODES } from '#lib/common.js';
import { AppError } from '#lib/errors.js';
import pool from '#config/db.js'; // Adapted to match your alias import style

// Flag to enable/disable trading hours enforcement
const ENFORCE_TRADING_HOURS = true; // Set to false to disable restriction

// Helper to check if current time is within Indian stock market trading hours
function isWithinTradingHours() {
    // Get current time in IST (UTC+5:30)
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const ist = new Date(utc + (5.5 * 60 * 60 * 1000));
    const hours = ist.getHours();
    const minutes = ist.getMinutes();
    // Trading hours: 9:15am to 3:30pm IST
    const startMinutes = 9 * 60 + 15; // 9:15am
    const endMinutes = 15 * 60 + 30; // 3:30pm
    const nowMinutes = hours * 60 + minutes;
    return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
}

const app = express();

// Create the HTTP server using the Express app
const server = http.createServer(app);

// Initialize Socket.IO and attach it to the HTTP server
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json()); // Parse incoming JSON payloads

// Express Routes
app.get("/ws", (req, res) => {
    return res.json("Hello from Arhneetii Live Tick Server");
});

/**
 * Fetch the last traded close price from Upstox historical candle API.
 * Uses a 1-day candle for the most recent trading day.
 */
async function fetchLastPrice(instrumentKey) {
    const today = new Date();
    const toDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // from_date = 7 days back to account for weekends / holidays
    const fromDate = new Date(today);
    fromDate.setDate(fromDate.getDate() - 7);
    const fromDateStr = fromDate.toISOString().split('T')[0];

    const encodedKey = encodeURIComponent(instrumentKey);
    const url = `https://api.upstox.com/v3/historical-candle/${encodedKey}/days/1/${toDate}/${fromDateStr}`;

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    // Attach bearer token if available
    if (process.env.UPSTOX_ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.UPSTOX_ACCESS_TOKEN}`;
    }

    const response = await axios.get(url, { headers });
    const candles = response.data?.data?.candles;

    if (!candles || candles.length === 0) {
        throw new Error(`No candle data returned for ${instrumentKey}`);
    }

    // candles are sorted most-recent first; pick the latest close price (index 4)
    const latestCandle = candles[0];
    return latestCandle[4]; // close price
}

// Incoming websocket connections
io.on('connection', (socket) => {
    logger.info(`New frontend client connected: ${socket.id}`);

    // Trading hours enforcement
    if (ENFORCE_TRADING_HOURS && !isWithinTradingHours()) {
        logger.warn(`Connection rejected for ${socket.id}: Outside trading hours.`);
        socket.emit('error_message', 'Connection rejected: Outside Indian stock market trading hours (9:15am-3:30pm IST).');
        socket.disconnect(true);
        return;
    }

    let dummyDataInterval;

    // Which company to track
    socket.on('subscribe', async (companySymbol) => {
        logger.info(`Starting live feed for: ${companySymbol}`);

        // Clear old data stream if user changes companies
        if (dummyDataInterval) clearInterval(dummyDataInterval);

        try {
            // 1. Query the companies table for instrument_key & tick_size
            const dbResult = await pool.query(
                'SELECT instrument_key, tick_size FROM companies WHERE symbol = $1 LIMIT 1',
                [companySymbol]
            );

            if (dbResult.rows.length === 0) {
                socket.emit('error_message', `Company not found for symbol: ${companySymbol}`);
                return;
            }

            const { instrument_key, tick_size } = dbResult.rows[0];
            logger.info(`Found instrument_key: ${instrument_key}, tick_size: ${tick_size}`);

            // 2. Fetch the last real stock price from Upstox
            let currentPrice;
            try {
                currentPrice = await fetchLastPrice(instrument_key);
                logger.info(`Fetched last close price for ${companySymbol}: ${currentPrice}`);
            } catch (apiErr) {
                logger.error(`Upstox API error: ${apiErr.message}`);
                socket.emit('error_message', `Could not fetch price from Upstox for ${companySymbol}`);
                return;
            }

            // 3. Generate dummy ticks using real base price & tick_size
            dummyDataInterval = setInterval(() => {
                // Fluctuate price by a random number of ticks (up to ±5 ticks)
                const ticks = Math.floor(Math.random() * 11) - 5; // -5 to +5
                const priceChange = ticks * tick_size;
                currentPrice = parseFloat((currentPrice + priceChange).toFixed(2));

                const liveTick = {
                    time: new Date().toISOString(),
                    symbol: companySymbol,
                    open: currentPrice,
                    high: parseFloat((currentPrice + 2 * tick_size).toFixed(2)),
                    low: parseFloat((currentPrice - 2 * tick_size).toFixed(2)),
                    close: currentPrice
                };

                // Emit the tick to the frontend
                socket.emit('live_data', liveTick);
            }, 1000);

        } catch (err) {
            logger.error(`Error during subscribe: ${err.message}`);
            socket.emit('error_message', 'Internal server error while setting up live feed.');
        }
    });

    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        if (dummyDataInterval) clearInterval(dummyDataInterval);
    });
});

// Global Error Handler (Good practice for a security platform)
app.use((err, req, res, next) => {
    if (err instanceof AppError && err.isOperational) {
        logger.warn(`Operational Error [${err.status}]: ${err.message}`);

        return res.status(err.status).json({
            success: false,
            error: err.message
        });
    }

    logger.error(`Unanticipated ERROR: ${err.message}\nStack: ${err.stack}`);

    return res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR_CODE).json({
        success: false,
        error: "An unexpected internal server error occurred."
    });
});

const PORT = process.env.PORT || 5002;

// Listen on the 'server' object instead of 'app' to bind both Express and Socket.IO
server.listen(PORT, () => {
    logger.info(`Live Tick Server (Express + WebSockets) is running on port ${PORT}`);
    // You will initialize your Mongo and Redis connections here later
});