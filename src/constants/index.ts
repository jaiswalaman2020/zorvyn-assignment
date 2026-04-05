// User roles and their permissions
export const ROLES = {
  VIEWER: "VIEWER",
  ANALYST: "ANALYST",
  ADMIN: "ADMIN",
} as const;

export const USER_STATUSES = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export const TRANSACTION_TYPES = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

// Role-based permissions
export const ROLE_PERMISSIONS = {
  [ROLES.VIEWER]: {
    canCreateRecords: false,
    canReadRecords: true,
    canReadAllRecords: false,
    canUpdateOwnRecords: false,
    canUpdateAllRecords: false,
    canDeleteOwnRecords: false,
    canDeleteAllRecords: false,
    canManageUsers: false,
    canAccessDashboard: true,
  },
  [ROLES.ANALYST]: {
    canCreateRecords: true,
    canReadRecords: true,
    canReadAllRecords: false,
    canUpdateOwnRecords: true,
    canUpdateAllRecords: false,
    canDeleteOwnRecords: true,
    canDeleteAllRecords: false,
    canManageUsers: false,
    canAccessDashboard: true,
  },
  [ROLES.ADMIN]: {
    canCreateRecords: true,
    canReadRecords: true,
    canReadAllRecords: true,
    canUpdateOwnRecords: true,
    canUpdateAllRecords: true,
    canDeleteOwnRecords: true,
    canDeleteAllRecords: true,
    canManageUsers: true,
    canAccessDashboard: true,
  },
} as const;

// Common expense categories
export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Business",
  "Other",
] as const;

// Common income categories
export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Bonus",
  "Side Hustle",
  "Gift",
  "Tax Refund",
  "Other",
] as const;

// Error codes
export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  BAD_REQUEST: "BAD_REQUEST",
  CONFLICT: "CONFLICT",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  RECORD_NOT_FOUND: "RECORD_NOT_FOUND",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
} as const;

// API paths
export const API_PATHS = {
  AUTH: "/api/auth",
  USERS: "/api/users",
  RECORDS: "/api/records",
  DASHBOARD: "/api/dashboard",
} as const;
