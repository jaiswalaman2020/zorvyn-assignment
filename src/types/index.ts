import { UserRole, UserStatus, TransactionType } from "@prisma/client";

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// User types
export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutPassword extends Omit<UserDTO, "password"> {}

// Financial Record types
export interface FinancialRecordDTO {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: Date;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard summary types
export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  recordCount: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
  recordCount: number;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  income: number;
  expenses: number;
  balance: number;
}

export interface RecentTransaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: Date;
  notes?: string;
}

// Auth types
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: UserWithoutPassword;
  token: string;
}

// Error types
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Request types with user context
export interface AuthenticatedRequest {
  userId: string;
  userRole: UserRole;
  userEmail: string;
}

// Query filter types
export interface RecordFilters {
  userId?: string;
  type?: TransactionType;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
}
