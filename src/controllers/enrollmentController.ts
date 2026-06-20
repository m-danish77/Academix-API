import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
const postEnroll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?._id;

    const course = await Course.findById(courseId);
    if (!course) {
      const err: any = new Error("This course does'nt exist.");
      err.status = 404;
      return next(err);
    }

    if (!studentId) {
      const err: any = new Error("Unauthorized: You are not loggedIn.");
      err.status = 401;
      return next(err);
    }

    if (
      req.user!.role === "admin" ||
      studentId.toString() === course.instructor.toString()
    ) {
      const err: any = new Error(
        "Admin can't enrolled in any course and Instructor can't enrolled in its own course..",
      );
      err.status = 400;
      return next(err);
    }

    // Checking if the student is already enrolled in the course
    const existingEnrollment = await Enrollment.findOne({
      studentId: studentId,
      courseId: `${courseId}`,
    });

    if (existingEnrollment) {
      const err: any = new Error("You are already enrolled in this course.");
      err.status = 400;
      return next(err);
    }

    // Checking that is'nt the total seats for enrollment of specific course is full
    const totalEnrolledStudents = await Enrollment.countDocuments({
      courseId: `${courseId}`,
    });
    if (totalEnrolledStudents >= course.maxCapacity) {
      const err: any = new Error("The course enrollment is full.");
      err.status = 400;
      return next(err);
    }

    const studentIsEnrolled = await Enrollment.create({
      studentId: studentId,
      courseId: course._id,
    });
    res.status(201).json({
      status: "success",
      message: "You are enrolled in this course.",
      data: studentIsEnrolled,
    });
  } catch (e) {
    next(e);
  }
};

const getSpecificStudentCourses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let studentId = req.user?._id.toString();
    const isAdmin = req.user?.role === "admin";

    if (isAdmin && !req.query.studentId) {
      const err: any = new Error(
        "Admin must provide studentId as a query parameter (e.g., ?studentId=...).",
      );
      err.status = 400;
      return next(err);
    }

    if (isAdmin && req.query.studentId) {
      const id = req.query.studentId as string;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        const err: any = new Error("Invalid student ID format.");
        err.status = 400;
        return next(err);
      }
      studentId = id;
    }

    if (!studentId) {
      const err: any = new Error("Unauthorized: You are not logged in.");
      err.status = 401;
      return next(err);
    }

    const allCourses = await Enrollment.find({ studentId })
      .populate("studentId", "name")
      .populate({
        path: "courseId",
        select: "title description",
        populate: { path: "instructor", select: "name" },
      });

    res.status(200).json(allCourses);
  } catch (e) {
    return next(e);
  }
};

const getSpecificCourseEnrolledStudents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      const err: any = new Error("Course Not Found");
      err.status = 401;
      return next(err);
    }
    if (
      req.user!.role !== "admin" &&
      req.user!._id.toString() !== course.instructor.toString()
    ) {
      const err: any = new Error("You are not Instructor of this course");
      err.status = 400;
      return next(err);
    }
    const courseStudents = await Enrollment.find({
      courseId: `${courseId}`,
    }).populate("studentId", "name email");
    res.status(200).json(courseStudents);
  } catch (e) {
    return next(e);
  }
};

export default {
  postEnroll,
  getSpecificStudentCourses,
  getSpecificCourseEnrolledStudents,
};
