import { Response, NextFunction } from "express";
import ResponseFormatter from "../utils/helpers/responseFormatter";
import { AuthRequest } from "./authenticate.middleware";

/**
 * Middleware to authorize requests based on user roles.
 */
const authorize =
  (allowedRoles: string[] = []) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user exists
      if (!req.user || !req.user.role) {
        res
          .status(403)
          .json(ResponseFormatter.error("Forbidden", 403));
        return;
      }

      // ✅ FIX: must return after next()
      if (allowedRoles.length === 0) {
        next();
        return;
      }

      // Check role
      if (!allowedRoles.includes(req.user.role)) {
        res
          .status(403)
          .json(
            ResponseFormatter.error("Insufficient permissions", 403)
          );
        return;
      }

      next();
    } catch (error) {
      res
        .status(403)
        .json(ResponseFormatter.error("Forbidden", 403));
    }
  };

export default authorize;