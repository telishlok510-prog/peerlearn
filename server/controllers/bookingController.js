import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { notify } from "../models/Notification.js";

const LOCATIONS = ["Library", "Reading Room", "Study Area", "Canteen"];

// @desc   Learner books a session with a tutor
// @route  POST /api/bookings  (protected)
export const createBooking = async (req, res) => {
  try {
    const { tutorId, subject, date, time, location } = req.body;

    if (!tutorId || !subject || !date || !time || !location) {
      return res.status(400).json({ message: "Please fill in all booking fields." });
    }
    if (!LOCATIONS.includes(location)) {
      return res.status(400).json({ message: "Invalid location." });
    }

    // Can't book yourself.
    if (tutorId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot book a session with yourself." });
    }

    const tutor = await User.findOne({ _id: tutorId, isTutor: true, status: "active" });
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found." });
    }

    const booking = await Booking.create({
      learner: req.user._id,
      tutor: tutor._id,
      subject,
      date,
      time,
      location,
      fee: tutor.tutorProfile?.feePerSession || 0,
    });

    // Notify the tutor that a new booking request arrived.
    await notify(
      tutor._id,
      "booking",
      `${req.user.fullName} requested a ${subject} session with you.`,
      "/my-bookings"
    );

    return res.status(201).json({
      message: "Booking request sent! The tutor will respond soon.",
      booking,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error creating booking.", error: error.message });
  }
};

// @desc   Get bookings made BY me (as a learner)
// @route  GET /api/bookings/my  (protected)
export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ learner: req.user._id })
    .populate("tutor", "fullName branch semester")
    .sort({ createdAt: -1 });
  return res.status(200).json({ bookings });
};

// @desc   Get booking requests sent TO me (as a tutor)
// @route  GET /api/bookings/requests  (protected)
export const getTutorRequests = async (req, res) => {
  const bookings = await Booking.find({ tutor: req.user._id })
    .populate("learner", "fullName branch semester email")
    .sort({ createdAt: -1 });
  return res.status(200).json({ bookings });
};

// @desc   Update a booking status (accept / reject / complete)
// @route  PATCH /api/bookings/:id/status  (protected)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Accepted", "Rejected", "Completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    const meId = req.user._id.toString();
    const isTutor = booking.tutor.toString() === meId;
    const isLearner = booking.learner.toString() === meId;

    if (!isTutor && !isLearner) {
      return res.status(403).json({ message: "Not your booking." });
    }

    // Only the tutor can accept or reject a pending request.
    if (status === "Accepted" || status === "Rejected") {
      if (!isTutor) {
        return res.status(403).json({ message: "Only the tutor can accept or reject." });
      }
      if (booking.status !== "Pending") {
        return res.status(400).json({ message: "This request has already been handled." });
      }
      booking.status = status;

      // Notify the learner that the tutor responded.
      await notify(
        booking.learner,
        "booking",
        `Your booking for ${booking.subject} was ${status.toLowerCase()}.`,
        "/my-bookings"
      );
    }

    // Either party can mark an accepted session as completed.
    if (status === "Completed") {
      if (booking.status !== "Accepted") {
        return res.status(400).json({ message: "Only accepted sessions can be completed." });
      }
      booking.status = "Completed";

      // Update the tutor's stats: one more session + earnings.
      await User.findByIdAndUpdate(booking.tutor, {
        $inc: {
          "tutorProfile.totalSessions": 1,
          "tutorProfile.earnings": booking.fee,
        },
      });
    }

    await booking.save();
    return res.status(200).json({ message: `Booking ${status.toLowerCase()}.`, booking });
  } catch (error) {
    return res.status(500).json({ message: "Server error updating booking.", error: error.message });
  }
};
