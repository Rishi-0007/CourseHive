import { Router } from "express";
import { createCourse, deleteCourse, getCourse, getCourses, updateCourse } from "../controllers/courseController.js";
import { checkCourseOwnership, instructorOnly, protect } from "../middlewares/auth.js";

const courseRouter = Router();

// public routes
courseRouter.get("/", getCourses);
courseRouter.get("/:slug", getCourse);

// protected routes
courseRouter.post("/create", protect, instructorOnly, createCourse);
courseRouter.put("/:id", protect, instructorOnly, checkCourseOwnership, updateCourse);
courseRouter.delete("/:id", protect, instructorOnly, checkCourseOwnership, deleteCourse);

export { courseRouter };