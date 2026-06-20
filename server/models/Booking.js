import mongoose from "mongoose";

// One booking = a learner requesting a paid session from a tutor.
const bookingSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: { type: String, required: true },
    date: { type: String, required: true }, // e.g. "2026-06-25"
    time: { type: String, required: true }, // e.g. "4 PM - 5 PM"
    location: {
      type: String,
      enum: ["Library", "Reading Room", "Study Area", "Canteen"],
      required: true,
    },
    sessionType: { type: String, default: "Paid Learning" },
    fee: { type: Number, default: 0 }, // copied from the tutor at booking time

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
