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
 *     summary: Get all courses with pagination
 *     tags: [Courses]
 *     description: Returns a paginated list of courses. No authentication required.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (starts from 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of courses per page (max 100)
 *     responses:
 *       200:
 *         description: Successful response with pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       title: { type: string }
 *                       description: { type: string }
 *                       maxCapacity: { type: number }
 *                       price: { type: number }
 *                       videoUrl: { type: string }
 *                       instructor:
 *                         type: object
 *                         properties:
 *                           _id: { type: string }
 *                           name: { type: string }
 *                           email: { type: string }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage: { type: integer, example: 1 }
 *                     totalPages: { type: integer, example: 5 }
 *                     totalItems: { type: integer, example: 42 }
 *                     itemsPerPage: { type: integer, example: 10 }
 *                     hasNextPage: { type: boolean, example: true }
 *                     hasPrevPage: { type: boolean, example: false }
 *       500:
 *         description: Internal server error
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
 *             required: [title, description, maxCapacity, price, videoUrl (optional)]
 *             properties:
 *               title: { type: string, example: "Node.js Masterclass" }
 *               description: { type: string, example: "Learn Node.js from scratch" }
 *               maxCapacity: { type: number, example: 30 }
 *               price: { type: number, example: 49.99 }
 *               videoUrl: { type: string, example: "https://www.youtube.com/watch?v=" }
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
 *               videoUrl: { type: string, example: "https://www.youtube.com/watch?v=" }
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
 *                 videoUrl: { type: string }
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
