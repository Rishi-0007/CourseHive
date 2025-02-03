import { Router } from "express";
import { enrollCourse, unenrollCourse } from "../controllers/enrollmentController";
import { protect } from "../middlewares/auth";

const enrollmentRouter = Router();

enrollmentRouter.post("/:courseId/enroll", protect, enrollCourse);
enrollmentRouter.post("/:courseId/unenroll", protect, unenrollCourse);

export { enrollmentRouter };