import { Router } from "express";
import AuthController from "../controllers/AuthController";
import { asyncHandler } from "../middleware";

const router = Router();

// Public routes
router.post("/login", asyncHandler(AuthController.login));
router.post("/register", asyncHandler(AuthController.register));

export default router;
