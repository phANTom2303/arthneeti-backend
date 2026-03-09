import mongoose from "mongoose";
import { logger } from "#config/logger.js";
export default async function connectMongoDB() {
    return mongoose.connect(process.env.MONGO_URI)
        .then(() => logger.info("Mongo Connection successful"))
        .catch((err) => {
            logger.error(`Mongo Connection failed: ${err}`);
            process.exit(1);
        });
}
