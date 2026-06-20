import express from "express";
import {
  createBooking,
  getMyBookings,
  getTutorRequests,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createBooking);              // learner books a session
router.get("/my", protect, getMyBookings);             // my bookings (as learner)
router.get("/requests", protect, getTutorRequests);    // requests to me (as tutor)
router.patch("/:id/status", protect, updateBookingStatus); // accept/reject/complete

export default router;
