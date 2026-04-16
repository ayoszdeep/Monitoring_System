import mongoose from "mongoose"
import config from "./config";
import logger from "../loggers/logger";

/**
 * MongoDB database manager/connector
 */
class MongoConnection {
    public connection: mongoose.Connection | null;

    constructor() {
        this.connection = null;
    }

    /**
     * Connect to MongoDB
     * @returns {Promise<mongoose.Connection>}
     */
    async connect(): Promise<mongoose.Connection> {
        try {
            if (this.connection) {
                logger.info("Mongodb already connected");
                return this.connection
            }

            await mongoose.connect(config.mongo.uri, {
                dbName: config.mongo.dbName
            })

            this.connection = mongoose.connection;

            logger.info(`MongoDB connected: ${config.mongo.uri}`);

            this.connection.on("error", err => {
                logger.error("MongoDB connection error", err)
            })

            this.connection.on("disconnected", () => {
                logger.error("MongoDB Disconnected")
            })

            return this.connection
        } catch (error) {
            logger.error('Failed to connect to MongoDB:', error);
            throw error;
        }
    }

    /**
     * This helps to disconnet the active mongodb connection
     */
    async disconnect(): Promise<void> {
        try {
            if (this.connection) {
                await mongoose.disconnect();
                this.connection = null;
                logger.info("Mongodb disconnected!")
            }
        } catch (error) {
            logger.error('Failed to disconnect to MongoDB:', error);
            throw error;
        }
    }

    /**
     * Get the active connection
     * @returns {mongoose.Connection | null}
     */
    getConnection(): mongoose.Connection | null {
        return this.connection;
    }
}

export default new MongoConnection();
