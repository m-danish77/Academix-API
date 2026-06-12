import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.ATLAS_URI;
    if (!uri) {
      throw new Error("ATLAS_URI is not defined in .env file.");
    }
    await mongoose.connect(uri);
    console.log("MongoDB Connected");
  } catch (e) {
    if (e instanceof Error) {
      console.error(`MongoDB Connection Error: ${e.message}`);
    } else {
      console.error("An unknown error occurred during DB connection:", e);
    }
    process.exit(1);
  }
};

export default connectDB;
