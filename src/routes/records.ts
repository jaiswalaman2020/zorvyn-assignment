import { Router } from "express";
import RecordController from "../controllers/RecordController";
import {
  requireAuth,
  requirePermission,
  asyncHandler,
} from "../middleware";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Analysts and Admins can create records
router.post(
  "/",
  requirePermission("canCreateRecords"),
  asyncHandler(RecordController.createRecord),
);

// All authenticated users can view records (controls applied in service)
router.get("/", asyncHandler(RecordController.getRecords));

router.get("/:id", asyncHandler(RecordController.getRecord));

// Category statistics
router.get(
  "/statistics/categories",
  asyncHandler(RecordController.getCategoryStatistics),
);

// Analysts and Admins can update their own records
router.put(
  "/:id",
  requirePermission("canUpdateOwnRecords"),
  asyncHandler(RecordController.updateRecord),
);

// Analysts and Admins can delete their own records
router.delete(
  "/:id",
  requirePermission("canDeleteOwnRecords"),
  asyncHandler(RecordController.deleteRecord),
);

export default router;
