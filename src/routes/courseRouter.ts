import express from "express";
import courseController from "../controllers/courseController.js";
import protect from "../middlewares/protect.js";
import restrictTo from "../middlewares/restrictTo.js";
import { validate } from "../middlewares/validate.js";
import {
  createCourseSchema,
  deleteCourseSchema,
  updateCourseSchema,
} from "../validations/courseValidation.js";

const courseRouter = express.Router();

courseRouter.get("/courses", courseController.getCourses);
courseRouter.post(
  "/courses",
  protect,
  restrictTo(["instructor", "admin"]),
  validate(createCourseSchema),
  courseController.createCourse,
);

courseRouter.put(
  "/courses/:courseId",
  protect,
  restrictTo(["instructor", "admin"]),
  validate(updateCourseSchema),
  courseController.updateCourse,
);

courseRouter.delete(
  "/courses/:courseId",
  protect,
  restrictTo(["instructor", "admin"]),
  validate(deleteCourseSchema),
  courseController.deleteCourse,
);

export default courseRouter;
