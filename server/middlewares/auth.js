import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { userModel } from "../models/user.js";
import { courseModel } from "../models/course.js";

const protect = asyncHandler(async (req, res, next) => {
    // Get token from cookies
    const token = req.cookies.token;

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await userModel.findOne({
            _id: decoded.id,
        });
        next();
    } catch (err) {
        res.status(401).json({ message: "Not authorized, token failed" });
    }
});

// Role-based middleware (e.g., instructor-only)
const instructorOnly = (req, res, next) => {
    if (req.user.role !== "instructor") {
        res.status(403).json({ message: "Not authorized as instructor" });
    }
    next();
};


// checkCourseOwnership middleware
const checkCourseOwnership = asyncHandler(async (req, res, next) => {
    const course = await courseModel.findById(req.params.id);
    if (!course) {
        res.status(404).json({ message: "Course not found" });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
        res.status(403).json({ message: "Not authorized to modify this course" });
    }

    req.course = course;
    next();
});

export { protect, instructorOnly, checkCourseOwnership };