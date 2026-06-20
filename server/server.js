import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import tutorRoutes from "./routes/tutorRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import exchangeRoutes from "./routes/exchangeRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Load variables from the .env file into process.env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
// In production, set CLIENT_URL to your frontend's domain to restrict access,
// e.g. CLIENT_URL=https://peerlearn.vercel.app
// If CLIENT_URL is not set, all origins are allowed (handy for local dev).
const corsOptions = process.env.CLIENT_URL
  ? { origin: process.env.CLIENT_URL.split(",").map((s) => s.trim()) }
  : {};

app.use(cors(corsOptions)); // allow the React frontend to call this API
app.use(express.json());    // let the server read JSON sent by the frontend

// A simple test route so we can confirm the server is alive.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PeerLearn server is running 🚀" });
});

// Feature routes
app.use("/api/auth", authRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/exchange", exchangeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
