import { Request, Response, NextFunction } from "express";
import { loginSchema, registerSchema } from "../validators";
import UserService from "../services/UserService";
import { formatSuccessResponse } from "../utils";

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loginSchema.parse(req.body);
      const result = await UserService.authenticate(
        input.email,
        input.password,
      );
      res.json(formatSuccessResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = registerSchema.parse(req.body);
      const user = await UserService.createUser({
        ...input,
        role: "VIEWER", // New users are viewers by default
      });
      res.status(201).json(formatSuccessResponse(user));
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
