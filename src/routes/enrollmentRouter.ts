import express from "express";
import enrollmentController from "../controllers/enrollmentController.js";
import protect from "../middlewares/protect.js";
import restrictTo from "../middlewares/restrictTo.js";
import { validate } from "../middlewares/validate.js";
import { enrollInCourseSchema } from "../validations/enrollmentValidation.js";

const enrollmentRouter = express.Router();

/**
 * @swagger
 * /enroll/{courseId}:
 *   post:
 *     summary: Enroll a student into a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB ObjectId of the course
 *     responses:
 *       201:
 *         description: Successfully enrolled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string }
 *                 data: { type: object }
 *       400:
 *         description: Already enrolled, course full, or instructor trying to enroll in own course
 *       401:
 *         description: Unauthorized (not logged in)
 *       404:
 *         description: Course not found
 */
enrollmentRouter.post(
  "/enroll/:courseId",
  protect,
  validate(enrollInCourseSchema),
  enrollmentController.postEnroll,
);

/**
 * @swagger
 * /my-courses:
 *   get:
 *     summary: Get courses the current user is enrolled in (or admin views a student's enrollments via ?studentId=)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         required: false
 *         schema: { type: string }
 *         description: (Admin only) student ID to view enrollments for
 *     responses:
 *       200:
 *         description: List of enrollments with course and instructor details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *                   studentId:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       name: { type: string }
 *                   courseId:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       title: { type: string }
 *                       description: { type: string }
 *                       instructor:
 *                         type: object
 *                         properties:
 *                           _id: { type: string }
 *                           name: { type: string }
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid studentId format (admin)
 */
enrollmentRouter.get(
  "/my-courses",
  protect,
  restrictTo(["student", "admin"]),
  enrollmentController.getSpecificStudentCourses,
);

/**
 * @swagger
 * /course/{courseId}/students:
 *   get:
 *     summary: Get all students enrolled in a specific course (instructor or admin only)
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB ObjectId of the course
 *     responses:
 *       200:
 *         description: List of enrolled students with their name and email
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *                   studentId:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       name: { type: string }
 *                       email: { type: string }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user is not the instructor nor admin)
 *       404:
 *         description: Course not found
 */
enrollmentRouter.get(
  "/course/:courseId/students",
  protect,
  restrictTo(["instructor", "admin"]),
  enrollmentController.getSpecificCourseEnrolledStudents,
);

export default enrollmentRouter;
