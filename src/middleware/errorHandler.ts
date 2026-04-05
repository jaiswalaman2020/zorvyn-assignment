import { Request, Response, NextFunction } from "express";
import { AppError } from "../types";
import { ZodError } from "zod";

export function errorHandler(
  error: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("Error:", error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      code: "BAD_REQUEST",
      details: (error as any).errors.map((e: any) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Handle application errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }

  // Handle Prisma unique constraint errors
  if (error.message && error.message.includes("Unique constraint failed")) {
    return res.status(409).json({
      success: false,
      error: "Resource already exists",
      code: "CONFLICT",
    });
  }

  // Handle Prisma not found errors
  if (error.message && error.message.includes("not found")) {
    return res.status(404).json({
      success: false,
      error: "Resource not found",
      code: "NOT_FOUND",
    });
  }

  // Generic error handler
  return res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 404 handler
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: `Route ${req.path} not found`,
    code: "NOT_FOUND",
  });
}
