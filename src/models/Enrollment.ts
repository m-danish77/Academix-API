import mongoose, { Document } from "mongoose";

interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
}

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Course",
    },
  },
  { timestamps: true },
);

const Enrollment =
  (mongoose.models.Enrollment as mongoose.Model<IEnrollment>) ||
  mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);

export default Enrollment;
