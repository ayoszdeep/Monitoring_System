// src/server.ts
import app from './app';
import config from './shared/config/config';
import logger from './shared/loggers/logger';
import { initializeServices, closeServices } from './loaders';

async function startServer() {
    try {
        await initializeServices();

        const server = app.listen(config.port, () => {
            logger.info(`🚀 Server started on port ${config.port}`);
            logger.info(`Environment: ${config.node_env}`);
        });

        const gracefulShutdown = async (signal: string) => {
            logger.info(`${signal} received. Shutting down...`);

            server.close(async () => {
                try {
                    await closeServices();
                    logger.info("Shutdown complete ✅");
                    process.exit(0);
                } catch (err) {
                    logger.error("Shutdown failed ❌", err);
                    process.exit(1);
                }
            });

            setTimeout(() => {
                logger.error("Forced shutdown ❌");
                process.exit(1);
            }, 10000);
        };

        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            gracefulShutdown('uncaughtException');
        });

        process.on('unhandledRejection', (reason) => {
            logger.error('Unhandled Rejection:', reason);
            gracefulShutdown('unhandledRejection');
        });

    } catch (error) {
        logger.error("Server failed to start ❌", error);
        process.exit(1);
    }
}

startServer();