import mongoose from "mongoose";

// One notification = an alert for a specific user about an event.
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, default: "info" }, // e.g. "booking", "review", "exchange"
    message: { type: String, required: true },
    link: { type: String, default: "" },     // where clicking the notification leads
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;

// Reusable helper so any controller can create a notification easily.
export const notify = async (userId, type, message, link = "") => {
  try {
    await Notification.create({ user: userId, type, message, link });
  } catch {
    // Notifications are non-critical — never break the main action if this fails.
  }
};
