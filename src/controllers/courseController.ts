import { Request, Response, NextFunction } from "express";
import Course from "../models/Course.js";

const getCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Parse and sanitize query parameters with defaults also add validations so that invalid values are handled gracefully
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string) || 10),
    );

    // 2. Calculate the number of documents to skip
    const skipIndex = (page - 1) * limit;

    // 3. Execute the data query and total count in parallel for performance
    const [allCourses, totalCourses] = await Promise.all([
      // .lean() Improves performance by returning plain JS objects
      Course.find()
        .populate("instructor", "name email")
        .skip(skipIndex)
        .limit(limit)
        .lean(),
      Course.countDocuments(),
    ]);

    // 4. Calculate total pages
    const totalPages = Math.ceil(totalCourses / limit);

    // 5. Send response with pagination metadata
    res.status(200).json({
      success: true,
      data: allCourses,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCourses: totalCourses,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
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
      const err: any = new Error(
        "Unauthorized: Instructor or Admin ID required",
      );
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
      err.status = 404;
      return next(err);
    }

    if (!req.user || !req.user._id) {
      const err: any = new Error(
        "Unauthorized: Instructor or Admin ID required",
      );
      err.status = 401;
      return next(err);
    }

    // We converted both of them to strings because two objects can never equal
    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== course.instructor.toString()
    ) {
      const err: any = new Error(
        "You don't created this course. Only Admin or Instructor who created the course can update it.",
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

    res.status(200).json(updateCourse);
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
      err.status = 404;
      return next(err);
    }

    if (!req.user || !req.user._id) {
      const err: any = new Error(
        "Unauthorized: Instructor or Admin ID required",
      );
      err.status = 401;
      return next(err);
    }

    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== course.instructor.toString()
    ) {
      const err: any = new Error(
        "You don't created this course. Only Admin or Instructor who created this course can delete it.",
      );
      err.status = 401;
      return next(err);
    }

    const deleteCourse = await Course.findByIdAndDelete(courseId);
    res
      .status(200)
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
