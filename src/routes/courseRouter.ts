import express from "express";
import courseController from "../controllers/courseController.js";
import protect from "../middlewares/protect.js";
import restrictTo from "../middlewares/restrictTo.js";

const courseRouter = express.Router();

courseRouter.get("/courses", courseController.getCourses);
courseRouter.post(
  "/courses",
  protect,
  restrictTo,
  courseController.createCourse,
);

courseRouter.put(
  "/courses/:courseId",
  protect,
  restrictTo,
  courseController.updateCourse,
);

courseRouter.delete(
  "/courses/:courseId",
  protect,
  restrictTo,
  courseController.deleteCourse,
);

export default courseRouter;
