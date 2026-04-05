import { Router } from "express";
import UserController from "../controllers/UserController";
import {
  requireAuth,
  requireAdmin,
  asyncHandler,
  checkResourceOwnership,
} from "../middleware";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Get current user info (by ID)
router.get("/:id", asyncHandler(UserController.getUserById));

// Update user profile
router.put(
  "/:id",
  checkResourceOwnership((req) => String(req.params.id)),
  asyncHandler(UserController.updateUser),
);

// Admin only routes
router.post("/", requireAdmin, asyncHandler(UserController.createUser));

router.get("/", requireAdmin, asyncHandler(UserController.getAllUsers));

router.delete(
  "/:id",
  requireAdmin,
  asyncHandler(UserController.deactivateUser),
);

router.get(
  "/admin/statistics",
  requireAdmin,
  asyncHandler(UserController.getUserStatistics),
);

export default router;
