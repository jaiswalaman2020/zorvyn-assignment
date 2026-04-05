import { Request, Response, NextFunction } from "express";
import DashboardService from "../services/DashboardService";
import { formatSuccessResponse } from "../utils";

export class DashboardController {
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.userRole === "ADMIN";
      const months = req.query.months
        ? parseInt(req.query.months as string)
        : 1;

      const summary = await DashboardService.getSummary(
        req.user!.userId,
        isAdmin,
        months,
      );
      res.json(formatSuccessResponse(summary));
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryBreakdown(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const isAdmin = req.user!.userRole === "ADMIN";
      const months = req.query.months
        ? parseInt(req.query.months as string)
        : 1;

      const breakdown = await DashboardService.getCategoryBreakdown(
        req.user!.userId,
        isAdmin,
        months,
      );
      res.json(formatSuccessResponse(breakdown));
    } catch (error) {
      next(error);
    }
  }

  static async getMonthlyTrend(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const isAdmin = req.user!.userRole === "ADMIN";
      const months = req.query.months
        ? parseInt(req.query.months as string)
        : 12;

      const trends = await DashboardService.getMonthlyTrend(
        req.user!.userId,
        isAdmin,
        months,
      );
      res.json(formatSuccessResponse(trends));
    } catch (error) {
      next(error);
    }
  }

  static async getRecentActivity(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const isAdmin = req.user!.userRole === "ADMIN";
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const activities = await DashboardService.getRecentTransactions(
        req.user!.userId,
        isAdmin,
        limit,
      );
      res.json(formatSuccessResponse(activities));
    } catch (error) {
      next(error);
    }
  }

  static async getIncomeVsExpenses(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const isAdmin = req.user!.userRole === "ADMIN";
      const months = req.query.months
        ? parseInt(req.query.months as string)
        : 12;

      const comparison = await DashboardService.getIncomeVsExpenses(
        req.user!.userId,
        isAdmin,
        months,
      );
      res.json(formatSuccessResponse(comparison));
    } catch (error) {
      next(error);
    }
  }

  static async getTopSpendingCategories(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const isAdmin = req.user!.userRole === "ADMIN";
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const months = req.query.months
        ? parseInt(req.query.months as string)
        : 1;

      const categories = await DashboardService.getTopSpendingCategories(
        req.user!.userId,
        isAdmin,
        limit,
        months,
      );
      res.json(formatSuccessResponse(categories));
    } catch (error) {
      next(error);
    }
  }
}

export default DashboardController;
