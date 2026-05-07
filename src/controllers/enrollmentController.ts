import { Request, Response } from "express";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
const postEnroll = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "This course does'nt exist." });
    }

    if (!studentId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: You are not loggedIn." });
    }

    if (studentId.toString() === course.instructor.toString()) {
      return res
        .status(400)
        .json({ message: "Instructor can't enrolled in its own course." });
    }

    const existingEnrollment = await Enrollment.findOne({
      studentId: studentId,
      courseId: courseId as any,
    });

    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "You are already enrolled in this course." });
    }

    const totalEnrolledStudents = await Enrollment.countDocuments({
      courseId: courseId as any,
    });
    if (totalEnrolledStudents >= course.maxCapacity) {
      return res
        .status(400)
        .json({ message: "The course enrollment if full." });
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
    res.status(400).json({ message: (e as Error).message });
  }
};

export default {
  postEnroll,
};
