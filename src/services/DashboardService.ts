import prisma from "../models/db";
import { DashboardSummary, MonthlyTrend, RecentTransaction } from "../types";
import { getDateRange, getMonthFromDate, decimalToNumber } from "../utils";

export class DashboardService {
  // Get overall dashboard summary
  async getSummary(userId: string, isAdmin: boolean, months: number = 1) {
    const { startDate, endDate } = getDateRange(months);

    const where: any = {
      isDeleted: false,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (!isAdmin) {
      where.userId = userId;
    }

    const [incomeData, expenseData, recordCount] = await Promise.all([
      prisma.financialRecord.aggregate({
        where: { ...where, type: "INCOME" },
        _sum: { amount: true },
      }),
      prisma.financialRecord.aggregate({
        where: { ...where, type: "EXPENSE" },
        _sum: { amount: true },
      }),
      prisma.financialRecord.count({ where }),
    ]);

    const totalIncome = decimalToNumber(incomeData._sum.amount);
    const totalExpenses = decimalToNumber(expenseData._sum.amount);

    const summary: DashboardSummary = {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      recordCount,
      period: {
        startDate,
        endDate,
      },
    };

    return summary;
  }

  // Get category breakdown (expenses by category)
  async getCategoryBreakdown(
    userId: string,
    isAdmin: boolean,
    months: number = 1,
  ) {
    const { startDate, endDate } = getDateRange(months);

    const where: any = {
      isDeleted: false,
      type: "EXPENSE",
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (!isAdmin) {
      where.userId = userId;
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

  // Get monthly trends
  async getMonthlyTrend(
    userId: string,
    isAdmin: boolean,
    months: number = 12,
  ): Promise<MonthlyTrend[]> {
    const { startDate } = getDateRange(months);

    const where: any = {
      isDeleted: false,
      date: {
        gte: startDate,
      },
    };

    if (!isAdmin) {
      where.userId = userId;
    }

    const records = await prisma.financialRecord.findMany({
      where,
      select: {
        type: true,
        amount: true,
        date: true,
      },
      orderBy: { date: "asc" },
    });

    // Group by month
    const monthlyData: Record<string, { income: number; expenses: number }> =
      {};

    records.forEach((record: any) => {
      const month = getMonthFromDate(record.date);
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }

      const amount = decimalToNumber(record.amount);
      if (record.type === "INCOME") {
        monthlyData[month].income += amount;
      } else {
        monthlyData[month].expenses += amount;
      }
    });

    // Format response
    return Object.entries(monthlyData)
      .map(([month, data]) => {
        const [year, monthNum] = month.split("-");
        return {
          month: new Date(
            parseInt(year),
            parseInt(monthNum) - 1,
          ).toLocaleString("default", {
            month: "long",
          }),
          year: parseInt(year),
          income: data.income,
          expenses: data.expenses,
          balance: data.income - data.expenses,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return (
          new Date(`${a.month} 1`).getMonth() -
          new Date(`${b.month} 1`).getMonth()
        );
      });
  }

  // Get recent transactions
  async getRecentTransactions(
    userId: string,
    isAdmin: boolean,
    limit: number = 10,
  ): Promise<RecentTransaction[]> {
    const where: any = {
      isDeleted: false,
    };

    if (!isAdmin) {
      where.userId = userId;
    }

    const records = await prisma.financialRecord.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit,
    });

    return records.map((r: any) => ({
      id: r.id,
      amount: decimalToNumber(r.amount),
      type: r.type,
      category: r.category,
      date: r.date,
      notes: r.notes || undefined,
    }));
  }

  // Get income vs expenses comparison
  async getIncomeVsExpenses(
    userId: string,
    isAdmin: boolean,
    months: number = 12,
  ) {
    const { startDate } = getDateRange(months);

    const where: any = {
      isDeleted: false,
      date: {
        gte: startDate,
      },
    };

    if (!isAdmin) {
      where.userId = userId;
    }

    const [income, expenses] = await Promise.all([
      prisma.financialRecord.aggregate({
        where: { ...where, type: "INCOME" },
        _sum: { amount: true },
      }),
      prisma.financialRecord.aggregate({
        where: { ...where, type: "EXPENSE" },
        _sum: { amount: true },
      }),
    ]);

    return {
      income: decimalToNumber(income._sum.amount),
      expenses: decimalToNumber(expenses._sum.amount),
      balance:
        decimalToNumber(income._sum.amount) -
        decimalToNumber(expenses._sum.amount),
    };
  }

  // Get top spending categories
  async getTopSpendingCategories(
    userId: string,
    isAdmin: boolean,
    limit: number = 5,
    months: number = 1,
  ) {
    const { startDate, endDate } = getDateRange(months);

    const where: any = {
      isDeleted: false,
      type: "EXPENSE",
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (!isAdmin) {
      where.userId = userId;
    }

    const categories = await prisma.financialRecord.groupBy({
      by: ["category"],
      where,
      _sum: { amount: true },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
      take: limit,
    });

    return categories.map((cat: any) => ({
      category: cat.category,
      total: decimalToNumber(cat._sum.amount),
    }));
  }
}

export default new DashboardService();
