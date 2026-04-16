import { Request, Response, NextFunction } from "express";
import logger from "../loggers/logger.js";
import { AppError } from "../utils/appError.js";
import ResponseFormatter from "../utils/responseFormatter.js";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: unknown = null;

  // ✅ AppError (your custom errors)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  else if ((err as any).name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values((err as any).errors).map((e: any) => e.message);
  }

  // ✅ Duplicate key error
  else if ((err as any).code === 11000) {
    statusCode = 409;
    message = "Duplicate key error";
  }

  // ✅ JWT errors
  else if ((err as any).name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if ((err as any).name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // ✅ Logging (VERY IMPORTANT)
  logger.error("Error occurred", {
    message: (err as any)?.message,
    statusCode,
    stack: (err as any)?.stack,
    path: req.path,
    method: req.method,
  });

  return res
    .status(statusCode)
    .json(ResponseFormatter.error(message, statusCode, errors));
};