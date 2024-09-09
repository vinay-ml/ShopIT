import mongoose from "mongoose";
import dotenv from "dotenv";
import "colors";

dotenv.config({ path: "backend/config/config.env" });

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("DB connected successfully".cyan.underline.bold);
  } catch (err) {
    console.error("DB connection error: ", err.message.red.bold);
    process.exit(1);
  }
};

export default connectDB;
