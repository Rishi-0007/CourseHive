import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { userModel } from "../models/user.js";
const protect = asyncHandler(async (req, res, next) => {
    // Get token from cookies
    const token = req.cookies.token;

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await userModel.findOne({
            _id: decoded.id,
        });
        next();
    } catch (err) {
        res.status(401);
        throw new Error("Not authorized, token failed");
    }
});

// Role-based middleware (e.g., instructor-only)
const instructorOnly = (req, res, next) => {
    if (req.user.role !== "instructor") {
        res.status(403);
        throw new Error("Not authorized as instructor");
    }
    next();
};

export { protect, instructorOnly };