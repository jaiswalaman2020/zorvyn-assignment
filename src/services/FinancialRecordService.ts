import prisma from "../models/db";
import { AppError } from "../types";
import {
  CreateFinancialRecordInput,
  UpdateFinancialRecordInput,
} from "../validators";
import {
  calculatePagination,
  createPaginationMetadata,
  decimalToNumber,
} from "../utils";
import { TransactionType, Prisma } from "@prisma/client";

export class FinancialRecordService {
  // Create a new financial record
  async createRecord(userId: string, input: CreateFinancialRecordInput) {
    const record = await prisma.financialRecord.create({
      data: {
        userId,
        amount: new Prisma.Decimal(input.amount),
        type: input.type,
        category: input.category,
        date: new Date(input.date),
        notes: input.notes,
      },
    });

    return this.formatRecord(record);
  }

  // Get record by ID
  async getRecordById(recordId: string, userId?: string) {
    const record = await prisma.financialRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new AppError("Record not found", 404, "RECORD_NOT_FOUND");
    }

    // Check ownership if userId provided
    if (userId && record.userId !== userId) {
      throw new AppError(
        "You do not have access to this record",
        403,
        "FORBIDDEN",
      );
    }

    return this.formatRecord(record);
  }

  // Get all records with filtering and pagination
  async getRecords(
    userId: string,
    isAdmin: boolean,
    filters: {
      page: number;
      limit: number;
      type?: TransactionType;
      category?: string;
      startDate?: Date;
      endDate?: Date;
      sortBy?: "date" | "amount";
      sortOrder?: "asc" | "desc";
    },
  ) {
    const { skip, take } = calculatePagination(filters.page, filters.limit);

    // Build where clause
    const where: any = {
      isDeleted: false,
    };

    // Non-admin users can only see their own records
    if (!isAdmin) {
      where.userId = userId;
    }

    // Apply filters
    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    // Get records and count
    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        skip,
        take,
        orderBy: {
          [filters.sortBy || "date"]: filters.sortOrder || "desc",
        },
      }),
      prisma.financialRecord.count({ where }),
    ]);

    return {
      records: records.map((r: any) => this.formatRecord(r)),
      pagination: createPaginationMetadata(total, filters.page, filters.limit),
    };
  }

  // Update record
  async updateRecord(
    recordId: string,
    userId: string,
    isAdmin: boolean,
    input: UpdateFinancialRecordInput,
  ) {
    const record = await prisma.financialRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new AppError("Record not found", 404, "RECORD_NOT_FOUND");
    }

    // Check ownership
    if (record.userId !== userId && !isAdmin) {
      throw new AppError(
        "You do not have permission to update this record",
        403,
        "FORBIDDEN",
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (input.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(input.amount);
    }
    if (input.type) updateData.type = input.type;
    if (input.category) updateData.category = input.category;
    if (input.date) updateData.date = new Date(input.date);
    if (input.notes !== undefined) updateData.notes = input.notes;

    const updatedRecord = await prisma.financialRecord.update({
      where: { id: recordId },
      data: updateData,
    });

    return this.formatRecord(updatedRecord);
  }

  // Soft delete record
  async deleteRecord(recordId: string, userId: string, isAdmin: boolean) {
    const record = await prisma.financialRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new AppError("Record not found", 404, "RECORD_NOT_FOUND");
    }

    // Check ownership
    if (record.userId !== userId && !isAdmin) {
      throw new AppError(
        "You do not have permission to delete this record",
        403,
        "FORBIDDEN",
      );
    }

    const deletedRecord = await prisma.financialRecord.update({
      where: { id: recordId },
      data: { isDeleted: true },
    });

    return this.formatRecord(deletedRecord);
  }

  // Get records statistics by category
  async getCategoryStatistics(
    userId: string,
    isAdmin: boolean,
    filters?: { startDate?: Date; endDate?: Date },
  ) {
    const where: any = {
      isDeleted: false,
      type: "EXPENSE",
    };

    if (!isAdmin) {
      where.userId = userId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    const categories = await prisma.financialRecord.groupBy({
      by: ["category"],
      where,
      _sum: { amount: true },
      _count: true,
    });

    const totalExpenses = await prisma.financialRecord.aggregate({
      where,
      _sum: { amount: true },
    });

    const total = decimalToNumber(totalExpenses._sum.amount);

    return categories
      .map((cat: any) => ({
        category: cat.category,
        total: decimalToNumber(cat._sum.amount),
        percentage:
          total > 0 ? (decimalToNumber(cat._sum.amount) / total) * 100 : 0,
        recordCount: cat._count,
      }))
      .sort((a: any, b: any) => b.total - a.total);
  }

  // Helper method to format record
  private formatRecord(record: any) {
    return {
      id: record.id,
      userId: record.userId,
      amount: decimalToNumber(record.amount),
      type: record.type,
      category: record.category,
      date: record.date,
      notes: record.notes,
      isDeleted: record.isDeleted,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

export default new FinancialRecordService();
