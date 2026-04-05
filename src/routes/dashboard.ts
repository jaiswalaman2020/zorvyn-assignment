import { Router } from "express";
import DashboardController from "../controllers/DashboardController";
import { requireAuth, requirePermission, asyncHandler } from "../middleware";

const router = Router();

// All routes require authentication and dashboard access
router.use(requireAuth);
router.use(requirePermission("canAccessDashboard"));

// Dashboard summary endpoints
router.get("/summary", asyncHandler(DashboardController.getSummary));

router.get(
  "/category-breakdown",
  asyncHandler(DashboardController.getCategoryBreakdown),
);

router.get("/monthly-trend", asyncHandler(DashboardController.getMonthlyTrend));

router.get(
  "/recent-activity",
  asyncHandler(DashboardController.getRecentActivity),
);

router.get(
  "/income-vs-expenses",
  asyncHandler(DashboardController.getIncomeVsExpenses),
);

router.get(
  "/top-spending",
  asyncHandler(DashboardController.getTopSpendingCategories),
);

export default router;
