import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import recordRoutes from "./records";
import dashboardRoutes from "./dashboard";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/records", recordRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
