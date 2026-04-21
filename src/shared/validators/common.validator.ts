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
        const errors = (result.error as any).errors.map(
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
    } catch (error) {
      res
        .status(400)
        .json(ResponseFormatter.error("Validation failed", 400));
    }
  };

export default validate;