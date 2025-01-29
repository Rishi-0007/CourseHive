import { Router } from "express";
import {
    forgotPassword,
    getUserProfile,
    loginUser,
    logoutUser,
    registerUser,
    resetPassword
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";
import { rateLimiter } from "../middlewares/rateLimit.js";

const authRouter = Router();

// public routes
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/forgot-password", rateLimiter, forgotPassword);
authRouter.post("/reset-password/:token", rateLimiter, resetPassword);

// protected routes
authRouter.post("/logout", protect, logoutUser);
authRouter.get("/profile", protect, getUserProfile);

export { authRouter };
