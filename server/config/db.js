import mongoose from "mongoose";

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/priyas_boutique";
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    return null;
  }
}

export default connectDB;
