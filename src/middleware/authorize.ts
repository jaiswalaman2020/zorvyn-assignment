import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { ROLE_PERMISSIONS } from "../constants";

type Permission = keyof (typeof ROLE_PERMISSIONS)["ADMIN"];

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
      code: "UNAUTHORIZED",
    });
    return;
  }
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required",
        code: "UNAUTHORIZED",
      });
      return;
    }

    if (!roles.includes(req.user.userRole)) {
      res.status(403).json({
        success: false,
        error: "Insufficient permissions",
        code: "FORBIDDEN",
      });
      return;
    }

    next();
  };
}

export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required",
        code: "UNAUTHORIZED",
      });
      return;
    }

    const rolePermissions = ROLE_PERMISSIONS[req.user.userRole as UserRole];
    if (!rolePermissions || !rolePermissions[permission]) {
      res.status(403).json({
        success: false,
        error: "Insufficient permissions",
        code: "FORBIDDEN",
      });
      return;
    }

    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
      code: "UNAUTHORIZED",
    });
    return;
  }

  if (req.user.userRole !== "ADMIN") {
    res.status(403).json({
      success: false,
      error: "Admin access required",
      code: "FORBIDDEN",
    });
    return;
  }

  next();
}

// Check if user owns the resource
export function checkResourceOwnership(
  getUserId: (req: Request) => string | undefined,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required",
        code: "UNAUTHORIZED",
      });
      return;
    }

    const resourceUserId = getUserId(req);
    const isOwner = resourceUserId === req.user.userId;
    const isAdmin = req.user.userRole === "ADMIN";

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        error: "You do not have permission to access this resource",
        code: "FORBIDDEN",
      });
      return;
    }

    next();
  };
}
