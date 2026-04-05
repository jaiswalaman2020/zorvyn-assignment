import { Request, Response, NextFunction } from "express";
import {
  paginationSchema,
  updateUserSchema,
  createUserSchema,
} from "../validators";
import UserService from "../services/UserService";
import { formatSuccessResponse, formatPaginatedResponse } from "../utils";

export class UserController {
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createUserSchema.parse(req.body);
      const user = await UserService.createUser(input);
      res.status(201).json(formatSuccessResponse(user));
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = paginationSchema.parse(req.query);
      const result = await UserService.getAllUsers(query.page, query.limit);
      res.json(
        formatPaginatedResponse(result.users, {
          total: result.total,
          page: query.page,
          limit: query.limit,
          pages: result.pages,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const user = await UserService.getUserById(id);
      res.json(formatSuccessResponse(user));
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const input = updateUserSchema.parse(req.body);

      // Check if user is allowed to update
      const isAllowed = UserService.isAllowedToUpdateUser(
        req.user!.userId,
        req.user!.userRole,
        id,
      );

      if (!isAllowed) {
        res.status(403).json({
          success: false,
          error: "Insufficient permissions",
          code: "FORBIDDEN",
        });
        return;
      }

      const user = await UserService.updateUser(id, input);
      res.json(formatSuccessResponse(user));
    } catch (error) {
      next(error);
    }
  }

  static async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const user = await UserService.deactivateUser(id);
      res.json(formatSuccessResponse(user));
    } catch (error) {
      next(error);
    }
  }

  static async getUserStatistics(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const stats = await UserService.getUserStatistics();
      res.json(formatSuccessResponse(stats));
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
