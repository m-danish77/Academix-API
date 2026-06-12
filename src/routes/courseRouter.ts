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

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     description: Returns a list of all courses (no authentication required)
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *                   title: { type: string }
 *                   description: { type: string }
 *                   maxCapacity: { type: number }
 *                   price: { type: number }
 *                   instructor: { type: object }
 */

courseRouter.get("/courses", courseController.getCourses);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, maxCapacity, price]
 *             properties:
 *               title: { type: string, example: "Node.js Masterclass" }
 *               description: { type: string, example: "Learn Node.js from scratch" }
 *               maxCapacity: { type: number, example: 30 }
 *               price: { type: number, example: 49.99 }
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */

courseRouter.post(
  "/courses",
  protect,
  restrictTo(["instructor", "admin"]),
  validate(createCourseSchema),
  courseController.createCourse,
);

/**
 * @swagger
 * /courses/{courseId}:
 *   put:
 *     summary: Update an existing course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the course
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, example: "Updated Node.js Course" }
 *               description: { type: string, example: "More advanced topics" }
 *               maxCapacity: { type: number, example: 25 }
 *               price: { type: number, example: 59.99 }
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id: { type: string }
 *                 title: { type: string }
 *                 description: { type: string }
 *                 maxCapacity: { type: number }
 *                 price: { type: number }
 *                 instructor: { type: string }
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not an instructor/admin or not the owner)
 *       404:
 *         description: Course not found
 */

courseRouter.put(
  "/courses/:courseId",
  protect,
  restrictTo(["instructor", "admin"]),
  validate(updateCourseSchema),
  courseController.updateCourse,
);

/**
 * @swagger
 * /courses/{courseId}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the course
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Course Deleted" }
 *                 deletedCourse: { type: object }
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not an instructor/admin or not the owner)
 *       404:
 *         description: Course not found
 */

courseRouter.delete(
  "/courses/:courseId",
  protect,
  restrictTo(["instructor", "admin"]),
  validate(deleteCourseSchema),
  courseController.deleteCourse,
);

export default courseRouter;
