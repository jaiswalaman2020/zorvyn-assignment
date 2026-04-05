import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AppError } from "../types";
import { JwtPayload, UserWithoutPassword } from "../types";
import { UserRole } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT Operations
export function generateToken(
  userId: string,
  email: string,
  role: UserRole,
  expiresIn: string = "7d",
): string {
  const payload: JwtPayload = {
    userId,
    email,
    role,
  };

  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn,
    algorithm: "HS256",
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Token has expired", 401, "TOKEN_EXPIRED");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid token", 401, "INVALID_TOKEN");
    }
    throw new AppError("Token verification failed", 401, "INVALID_TOKEN");
  }
}

// User conversion utilities
export function userToDTO(user: any): UserWithoutPassword {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Pagination helpers
export function calculatePagination(page: number, limit: number) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

export function createPaginationMetadata(
  total: number,
  page: number,
  limit: number,
) {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

// Date helpers
export function getDateRange(months: number = 1) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  return { startDate, endDate };
}

export function getMonthFromDate(date: Date): string {
  return date.toISOString().substring(0, 7); // Returns YYYY-MM
}

// Decimal helpers (since financial amounts use Decimal)
export function decimalToNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return parseFloat(value.toString());
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Response formatting
export function formatSuccessResponse<T>(data: T) {
  return {
    success: true,
    data,
  };
}

export function formatErrorResponse(message: string, code?: string) {
  return {
    success: false,
    error: message,
    code: code || "UNKNOWN_ERROR",
  };
}

export function formatPaginatedResponse<T>(
  data: T[],
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  },
) {
  return {
    success: true,
    data,
    pagination,
  };
}
