// src/loaders/index.ts
import mongodb from '../shared/config/mongodb';
import postgres from '../shared/config/postgres';
import rabbitmq from '../shared/config/rabbitmq';
import logger from '../shared/loggers/logger';

export async function initializeServices() {
    try {
        logger.info("Initializing services...");

        await mongodb.connect();
        await postgres.testConnection();
        await rabbitmq.connect();

        logger.info("All services initialized ✅");
    } catch (error) {
        logger.error("Initialization failed ❌", error);
        throw error;
    }
}

export async function closeServices() {
    try {
        await mongodb.disconnect();
        await postgres.close();
        await rabbitmq.close();

        logger.info("All services closed ✅");
    } catch (error) {
        logger.error("Error closing services ❌", error);
        throw error;
    }
}