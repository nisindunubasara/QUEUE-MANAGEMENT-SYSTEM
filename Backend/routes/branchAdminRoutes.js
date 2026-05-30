import express from "express";
import {
	getBranchAdminCounts,
	getBranchAdminOperations,
	updateBranchServiceDailyLimits,
	updateBranchServiceTokenLimit,
	updateBranchServiceStatus,
	updateBranchOperatingHours,
	updateServiceAverageTime,
} from "../controllers/branchAdminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const branchAdminRouter = express.Router();

// GET /api/branch-admin/counts - branch scoped dashboard counts (from req.user.branchId)
branchAdminRouter.get("/counts", authMiddleware, getBranchAdminCounts);

// GET /api/branch-admin/operations - branch scoped operations dashboard data
branchAdminRouter.get("/operations", authMiddleware, getBranchAdminOperations);

branchAdminRouter.patch("/services/:serviceId/limit", authMiddleware, updateBranchServiceTokenLimit);
branchAdminRouter.patch("/services/:serviceId/status", authMiddleware, updateBranchServiceStatus);
branchAdminRouter.patch("/services/:serviceId/daily-limits", authMiddleware, updateBranchServiceDailyLimits);
branchAdminRouter.patch("/services/:serviceId/average-time", authMiddleware, updateServiceAverageTime);

// PATCH /api/branch-admin/operating-hours - update branch operating hours
branchAdminRouter.patch("/operating-hours", authMiddleware, updateBranchOperatingHours);

export default branchAdminRouter;
