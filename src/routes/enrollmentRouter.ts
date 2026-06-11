import express from "express";
import enrollmentController from "../controllers/enrollmentController.js";
import protect from "../middlewares/protect.js";
import restrictTo from "../middlewares/restrictTo.js";
import { validate } from "../middlewares/validate.js";
import { enrollInCourseSchema } from "../validations/enrollmentValidation.js";

const enrollmentRouter = express.Router();

enrollmentRouter.post(
  "/enroll/:courseId",
  protect,
  validate(enrollInCourseSchema),
  enrollmentController.postEnroll,
);

enrollmentRouter.get(
  "/my-courses",
  protect,
  restrictTo(["student", "admin"]),
  enrollmentController.getSpecificStudentCourses,
);

// We are showing to the admin that for a specific course which students are enrolled in this course and their non-sensitive data.
enrollmentRouter.get(
  "/course/:courseId/students",
  protect,
  restrictTo(["instructor", "admin"]),
  enrollmentController.getSpecificCourseEnrolledStudents,
);

export default enrollmentRouter;
