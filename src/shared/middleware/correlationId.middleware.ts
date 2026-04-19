import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { asyncLocalStorage } from "../utils/helpers/request.helpers";

export const attachCorrelationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const correlationId = crypto.randomUUID();

  res.setHeader('x-correlation-id', correlationId);

  asyncLocalStorage.run({ correlationId }, () => {
    next();
  });
};