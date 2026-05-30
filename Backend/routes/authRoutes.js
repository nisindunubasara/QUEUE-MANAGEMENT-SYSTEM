import express from "express";
import { heartbeat, loginUser, logoutUser, registerUser, updateProfile, } from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", authMiddleware, logoutUser);
authRouter.post("/heartbeat", authMiddleware, heartbeat);
authRouter.patch("/profile", authMiddleware, updateProfile);

export default authRouter;
