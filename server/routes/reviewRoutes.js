import express from "express";
import {
  createReview,
  getTutorReviews,
  getMyReviewedBookings,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReview);              // leave a review
router.get("/mine", protect, getMyReviewedBookings);  // which bookings I've reviewed
router.get("/tutor/:tutorId", getTutorReviews);       // public: a tutor's reviews

export default router;
