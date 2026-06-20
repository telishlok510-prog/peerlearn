import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";

// @desc   Summary counts for the admin dashboard
// @route  GET /api/admin/stats  (admin)
export const getAdminStats = async (req, res) => {
  const [users, tutors, bookings, reviews] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ isTutor: true }),
    Booking.countDocuments(),
    Review.countDocuments(),
  ]);
  return res.status(200).json({ stats: { users, tutors, bookings, reviews } });
};

// @desc   List all users (students)
// @route  GET /api/admin/users  (admin)
export const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "student" })
    .select("fullName email enrollmentNumber branch semester isTutor status createdAt")
    .sort({ createdAt: -1 });
  return res.status(200).json({ users });
};

// @desc   List all tutors
// @route  GET /api/admin/tutors  (admin)
export const getAllTutors = async (req, res) => {
  const tutors = await User.find({ isTutor: true })
    .select("fullName email branch semester tutorProfile status")
    .sort({ createdAt: -1 });
  return res.status(200).json({ tutors });
};

// @desc   List all bookings
// @route  GET /api/admin/bookings  (admin)
export const getAllBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate("learner", "fullName email")
    .populate("tutor", "fullName email")
    .sort({ createdAt: -1 });
  return res.status(200).json({ bookings });
};

// @desc   List all reviews
// @route  GET /api/admin/reviews  (admin)
export const getAllReviews = async (req, res) => {
  const reviews = await Review.find()
    .populate("learner", "fullName")
    .populate("tutor", "fullName")
    .sort({ createdAt: -1 });
  return res.status(200).json({ reviews });
};

// @desc   Block or unblock a user (remove/restore fake profiles)
// @route  PATCH /api/admin/users/:id/block  (admin)
export const setUserBlocked = async (req, res) => {
  try {
    const { blocked } = req.body; // true = block, false = unblock
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.role === "admin") {
      return res.status(400).json({ message: "You cannot block an admin." });
    }

    user.status = blocked ? "blocked" : "active";
    await user.save();
    return res.status(200).json({
      message: blocked ? "User blocked." : "User unblocked.",
      status: user.status,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};
