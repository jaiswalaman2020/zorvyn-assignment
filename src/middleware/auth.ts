import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils";
import { AppError, AuthenticatedRequest } from "../types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedRequest;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Missing authorization token", 401, "UNAUTHORIZED");
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const payload = verifyToken(token);

    req.user = {
      userId: payload.userId,
      userEmail: payload.email,
      userRole: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }
    res.status(401).json({
      success: false,
      error: "Authentication failed",
      code: "UNAUTHORIZED",
    });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      req.user = {
        userId: payload.userId,
        userEmail: payload.email,
        userRole: payload.role,
      };
    }

    next();
  } catch {
    // If token verification fails, continue without user context
    next();
  }
}
