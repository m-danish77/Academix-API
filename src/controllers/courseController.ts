import { Request, Response } from "express";
import Course from "../models/Course.js";

const getCourses = async (req: Request, res: Response) => {
  try {
    const allCourses = await Course.find().populate("instructor", "name email");
    res.status(200).json(allCourses);
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
  }
};

const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, maxCapacity, price } = req.body;

    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Instructor ID required" });
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
    res.status(400).json({ message: (e as Error).message });
  }
};

const updateCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, maxCapacity, price } = req.body;
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(401).json({ message: "Course Not Found" });
    }

    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Instructor ID required" });
    }

    // We converted both of them to strings because two objects can never equal
    if (req.user._id.toString() !== course.instructor.toString()) {
      return res.status(401).json({
        message:
          "You don't created this course. Only admin who created the course can update it.",
      });
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
    res.status(400).json({ message: (e as Error).message });
  }
};

const deleteCourse = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(401).json({ message: "Course Not Found" });
    }

    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Instructor ID required" });
    }

    if (req.user._id.toString() !== course.instructor.toString()) {
      return res.status(401).json({
        message:
          "You don't created this course. Only admin who created this course can delete it.",
      });
    }

    const deleteCourse = await Course.findByIdAndDelete(courseId);

    res
      .status(201)
      .json({ message: "Course Deleted", deleteCourse: deleteCourse });
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
  }
};

export default {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};
