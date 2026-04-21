import logger from "../shared/loggers/logger";
import { closeServices } from "../loaders";
import { Server } from "http";

export const setupGracefulShutdown = (server: Server) => {
  const shutdown = async (signal: string) => {
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

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Rejection:", reason);
    shutdown("unhandledRejection");
  });
};