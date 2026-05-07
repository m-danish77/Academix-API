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

export default enrollmentRouter;
