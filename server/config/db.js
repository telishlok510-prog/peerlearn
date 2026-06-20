import mongoose from "mongoose";

// Connects our app to the local MongoDB database.
// The connection string comes from the .env file (MONGO_URI).
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Stop the app if we cannot reach the database.
    process.exit(1);
  }
};

export default connectDB;
