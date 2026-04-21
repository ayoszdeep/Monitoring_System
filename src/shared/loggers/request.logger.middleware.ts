import { Request, Response, NextFunction } from "express";
import logger from "../loggers/logger";

const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start: number = Date.now();

  res.on("finish", () => {
    const duration: number = Date.now() - start;

    logger.info(
      "HTTP %s %s %s %dms",
      req.method,
      req.originalUrl || req.url,
      req.ip || req.socket.remoteAddress,
      duration,
      {
        method: req.method,
        path: req.originalUrl || req.url,
        status: res.statusCode,
        duration,
      }
    );
  });

  next();
};

export default requestLogger;