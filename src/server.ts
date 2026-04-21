import app from "./app";
import config from "./shared/config/config";
import logger from "./shared/loggers/logger";
import { initializeServices } from "./loaders";
import { setupGracefulShutdown } from "./loaders/graceFullShutdown";

async function startServer() {
  try {
    await initializeServices();

    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server started on port ${config.port}`);
      logger.info(`Environment: ${config.node_env}`);
    });

    setupGracefulShutdown(server); 
  } catch (error) {
    logger.error("Server failed to start ❌", error);
    process.exit(1);
  }
}

startServer();