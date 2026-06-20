import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { notify } from "../models/Notification.js";

// Recalculates a tutor's average rating and total review count from scratch.
const recalcTutorRating = async (tutorId) => {
  const reviews = await Review.find({ tutor: tutorId });
  const total = reviews.length;
  const average =
    total === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / total;

  await User.findByIdAndUpdate(tutorId, {
    "tutorProfile.averageRating": Math.round(average * 10) / 10, // 1 decimal
    "tutorProfile.totalReviews": total,
  });
};

// @desc   Leave a review for a completed session
// @route  POST /api/reviews  (protected)
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, feedback } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: "Booking and rating are required." });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    // Only the learner who took the session can review it.
    if (booking.learner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only review your own sessions." });
    }
    // Only completed sessions can be reviewed.
    if (booking.status !== "Completed") {
      return res.status(400).json({ message: "You can only review completed sessions." });
    }
    // Prevent duplicate reviews for the same booking.
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(409).json({ message: "You already reviewed this session." });
    }

    const review = await Review.create({
      booking: bookingId,
      learner: booking.learner,
      tutor: booking.tutor,
      rating,
      feedback: feedback || "",
    });

    // Update the tutor's average rating.
    await recalcTutorRating(booking.tutor);

    // Notify the tutor about the new review.
    await notify(
      booking.tutor,
      "review",
      `You received a ${rating}-star review.`,
      "/become-tutor"
    );

    return res.status(201).json({ message: "Thanks for your review!", review });
  } catch (error) {
    return res.status(500).json({ message: "Server error creating review.", error: error.message });
  }
};

// @desc   Get all reviews for a tutor (public, shown on profile)
// @route  GET /api/reviews/tutor/:tutorId
export const getTutorReviews = async (req, res) => {
  const reviews = await Review.find({ tutor: req.params.tutorId })
    .populate("learner", "fullName")
    .sort({ createdAt: -1 });
  return res.status(200).json({ reviews });
};

// @desc   Get the set of booking IDs the current user has already reviewed
// @route  GET /api/reviews/mine  (protected)
export const getMyReviewedBookings = async (req, res) => {
  const reviews = await Review.find({ learner: req.user._id }).select("booking");
  return res.status(200).json({ bookingIds: reviews.map((r) => r.booking) });
};
