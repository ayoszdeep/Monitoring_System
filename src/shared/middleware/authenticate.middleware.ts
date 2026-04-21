import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/config";
import ResponseFormatter from "../utils/helpers/responseFormatter";
import logger from "../loggers/logger";

/**
 * Custom JWT payload interface
 */
interface AuthPayload extends JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  clientId?: string;
}

/**
 * Extend Express Request to include user
 */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
    role: string;
    clientId?: string;
  };
}

/**
 * Middleware to authenticate requests using JWT.
 */
const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | null = null;

    if (req.cookies?.authToken) {
      token = req.cookies.authToken;
    }

    if (!token) {
      res
        .status(401)
        .json(ResponseFormatter.error("Authentication token is required", 401));
      return;
    }

    const decoded = jwt.verify(
      token,
      config.jwt.secret
    ) as AuthPayload;

    const { userId, email, username, role, clientId } = decoded;

    req.user = {
      userId,
      email,
      username,
      role,
      clientId,
    };

    next();
  } catch (error: any) {
    logger.error("Authentication failed", {
      error: error.message,
      path: req.path,
    });

    if (error.name === "TokenExpiredError") {
      res
        .status(401)
        .json(ResponseFormatter.error("Token expired", 401));
      return;
    }

    res
      .status(401)
      .json(ResponseFormatter.error("Invalid token", 401));
  }
};

export default authenticate;