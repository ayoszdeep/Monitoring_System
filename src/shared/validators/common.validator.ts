import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import ResponseFormatter from "../utils/helpers/responseFormatter";

/**
 * Middleware to validate request body using Zod schema
 */
const validate =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!schema) {
        next();
        return;
      }

      const result = schema.safeParse(req.body);

      if (!result.success) {
        const zodErrors = (result.error as any).issues || (result.error as any).errors || [];
        const errors = zodErrors.map(
          (err: any) => `${err.path.join(".")} ${err.message}`
        );

        res
          .status(400)
          .json(ResponseFormatter.error("Validation failed", 400, errors));
        return;
      }

      // ✅ overwrite body with parsed (safe + typed data)
      req.body = result.data;

      next();
    } catch (error: any) {
      res
        .status(400)
        .json(ResponseFormatter.error("Validation failed (Catch Block)", 400, error?.message || error));
    }
  };

export default validate;