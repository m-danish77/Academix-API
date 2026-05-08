import { Request, Response, NextFunction } from "express";
import Course from "../models/Course.js";

const getCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allCourses = await Course.find().populate("instructor", "name email");
    res.status(200).json(allCourses);
  } catch (e) {
    next(e);
  }
};

const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description, maxCapacity, price } = req.body;

    if (!req.user || !req.user._id) {
      const err: any = new Error("Unauthorized: Instructor ID required");
      err.status = 401;
      return next(err);
    }

    const newCourse = await Course.create({
      title,
      description,
      maxCapacity,
      price,
      instructor: req.user._id,
    });

    res.status(201).json(newCourse);
  } catch (e) {
    next(e);
  }
};

const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description, maxCapacity, price } = req.body;
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId);

    if (!course) {
      const err: any = new Error("Course Not Found");
      err.status = 401;
      return next(err);
    }

    if (!req.user || !req.user._id) {
      const err: any = new Error("Unauthorized: Instructor ID required");
      err.status = 401;
      return next(err);
    }

    // We converted both of them to strings because two objects can never equal
    if (req.user._id.toString() !== course.instructor.toString()) {
      const err: any = new Error(
        "You don't created this course. Only admin who created the course can update it.",
      );
      err.status = 401;
      return next(err);
    }
    const updateCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        title,
        description,
        maxCapacity,
        price,
      },
      { returnDocument: "after" },
    );

    res.status(201).json(updateCourse);
  } catch (e) {
    next(e);
  }
};

const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId);

    if (!course) {
      const err: any = new Error("Course Not Found");
      err.status = 401;
      return next(err);
    }

    if (!req.user || !req.user._id) {
      const err: any = new Error("Unauthorized: Instructor ID required");
      err.status = 401;
      return next(err);
    }

    if (req.user._id.toString() !== course.instructor.toString()) {
      const err: any = new Error(
        "You don't created this course. Only admin who created this course can delete it.",
      );
      err.status = 401;
      return next(err);
    }

    const deleteCourse = await Course.findByIdAndDelete(courseId);
    res
      .status(201)
      .json({ message: "Course Deleted", deleteCourse: deleteCourse });
  } catch (e) {
    next(e);
  }
};

export default {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};
