import { Request, Response, NextFunction } from "express";
import {
  createFinancialRecordSchema,
  updateFinancialRecordSchema,
  filterRecordsSchema,
} from "../validators";
import FinancialRecordService from "../services/FinancialRecordService";
import { formatSuccessResponse, formatPaginatedResponse } from "../utils";

export class RecordController {
  static async createRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createFinancialRecordSchema.parse(req.body);
      const record = await FinancialRecordService.createRecord(
        req.user!.userId,
        input,
      );
      res.status(201).json(formatSuccessResponse(record));
    } catch (error) {
      next(error);
    }
  }

  static async getRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const isAdmin = req.user!.userRole === "ADMIN";

      const record = await FinancialRecordService.getRecordById(
        id,
        isAdmin ? undefined : req.user!.userId,
      );

      res.json(formatSuccessResponse(record));
    } catch (error) {
      next(error);
    }
  }

  static async getRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const query = filterRecordsSchema.parse(req.query);
      const isAdmin = req.user!.userRole === "ADMIN";

      const result = await FinancialRecordService.getRecords(
        req.user!.userId,
        isAdmin,
        {
          page: query.page,
          limit: query.limit,
          type: query.type,
          category: query.category,
          startDate: query.startDate ? new Date(query.startDate) : undefined,
          endDate: query.endDate ? new Date(query.endDate) : undefined,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
        },
      );

      res.json(formatPaginatedResponse(result.records, result.pagination));
    } catch (error) {
      next(error);
    }
  }

  static async updateRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const input = updateFinancialRecordSchema.parse(req.body);
      const isAdmin = req.user!.userRole === "ADMIN";

      const record = await FinancialRecordService.updateRecord(
        id,
        req.user!.userId,
        isAdmin,
        input,
      );

      res.json(formatSuccessResponse(record));
    } catch (error) {
      next(error);
    }
  }

  static async deleteRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const isAdmin = req.user!.userRole === "ADMIN";

      await FinancialRecordService.deleteRecord(id, req.user!.userId, isAdmin);

      res.json(formatSuccessResponse({ id }));
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryStatistics(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const isAdmin = req.user!.userRole === "ADMIN";
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      const stats = await FinancialRecordService.getCategoryStatistics(
        req.user!.userId,
        isAdmin,
        { startDate, endDate },
      );

      res.json(formatSuccessResponse(stats));
    } catch (error) {
      next(error);
    }
  }
}

export default RecordController;
