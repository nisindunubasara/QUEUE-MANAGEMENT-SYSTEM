import express from "express";
import {
	createBranchAdmin,
	createBankBranchAdmin,
	createBankBranchStaffUser,
	createBankOrganizationAdmin,
	createHospitalBranchAdmin,
	createHospitalOrganizationAdmin,
	createHospitalStaffUser,
	createOrganizationAdmin,
	createStaffUser,
	getAllUsers,
	getUsers,
	loginUser,
	registerUser,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Common multi-tenant user endpoints.
userRouter.post("/organization-admins", authMiddleware, createOrganizationAdmin);
userRouter.post("/branch-admins", authMiddleware, createBranchAdmin);
userRouter.post("/staff", authMiddleware, createStaffUser);
userRouter.get("/", authMiddleware, getUsers);

// Legacy aliases kept for migration safety.
userRouter.get("/list", authMiddleware, getAllUsers);
userRouter.post("/bank/organization-admins", authMiddleware, createBankOrganizationAdmin);
userRouter.post("/bank/branch-admins", authMiddleware, createBankBranchAdmin);
userRouter.post("/bank/staff", authMiddleware, createBankBranchStaffUser);
userRouter.post("/hospital/organization-admins", authMiddleware, createHospitalOrganizationAdmin);
userRouter.post("/hospital/branch-admins", authMiddleware, createHospitalBranchAdmin);
userRouter.post("/hospital/staff", authMiddleware, createHospitalStaffUser);

// Optional police aliases during migration; all call the same common controllers.
userRouter.post("/police/organization-admins", authMiddleware, createOrganizationAdmin);
userRouter.post("/police/branch-admins", authMiddleware, createBranchAdmin);
userRouter.post("/police/staff", authMiddleware, createStaffUser);

export default userRouter;