import { Router } from "express";
import { enrollCourse, unenrollCourse } from "../controllers/enrollmentController.js";
import { protect } from "../middlewares/auth.js";

const enrollmentRouter = Router();

enrollmentRouter.post("/:courseId/enroll", protect, enrollCourse);
enrollmentRouter.post("/:courseId/unenroll", protect, unenrollCourse);

export { enrollmentRouter };