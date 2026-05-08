import express from "express";
import enrollmentController from "../controllers/enrollmentController.js";
import protect from "../middlewares/protect.js";
import restrictTo from "../middlewares/restrictTo.js";

const enrollmentRouter = express.Router();

enrollmentRouter.post(
  "/enroll/:courseId",
  protect,
  enrollmentController.postEnroll,
);

enrollmentRouter.get(
  "/my-courses",
  protect,
  enrollmentController.getSpecificStudentCourses,
);

// We are showing to the admin that for a specific course which students are enrolled in this course and their non-sensitive data.
enrollmentRouter.get(
  "/course/:courseId/students",
  protect,
  restrictTo,
  enrollmentController.getSpecificCourseEnrolledStudents,
);

export default enrollmentRouter;
