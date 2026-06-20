import Booking from "../models/Booking.js";
import User from "../models/User.js";

// @desc   Get the four dashboard card numbers for the logged-in user
// @route  GET /api/dashboard/stats  (protected)
export const getDashboardStats = async (req, res) => {
  try {
    const meId = req.user._id;

    const [totalBookings, upcomingSessions, pendingRequests] = await Promise.all([
      // Total sessions I booked as a learner.
      Booking.countDocuments({ learner: meId }),
      // Upcoming = accepted sessions where I'm learner or tutor.
      Booking.countDocuments({
        status: "Accepted",
        $or: [{ learner: meId }, { tutor: meId }],
      }),
      // Pending requests waiting for me to act on (as a tutor).
      Booking.countDocuments({ tutor: meId, status: "Pending" }),
    ]);

    // Reviews received as a tutor (already tracked on the profile).
    const me = await User.findById(meId);
    const reviewsReceived = me.tutorProfile?.totalReviews || 0;

    return res.status(200).json({
      stats: {
        totalBookings,
        upcomingSessions,
        pendingRequests,
        reviewsReceived,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};
