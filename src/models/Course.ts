import mongoose, { Document, mongo } from "mongoose";

interface ICourse extends Document {
  title: string;
  description: string;
  maxCapacity: number;
  price: number;
  videoUrl?: string;
  instructor: mongoose.Types.ObjectId;
}

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    maxCapacity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      max: 2000,
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Course =
  (mongoose.models.Course as mongoose.Model<ICourse>) ||
  mongoose.model<ICourse>("Course", courseSchema);

export default Course;
