import Notification from "../models/Notification.js";

// @desc   Get my notifications (newest first) + unread count
// @route  GET /api/notifications  (protected)
export const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  const unread = await Notification.countDocuments({ user: req.user._id, read: false });
  return res.status(200).json({ notifications, unread });
};

// @desc   Get just the unread count (used by the navbar bell)
// @route  GET /api/notifications/unread-count  (protected)
export const getUnreadCount = async (req, res) => {
  const unread = await Notification.countDocuments({ user: req.user._id, read: false });
  return res.status(200).json({ unread });
};

// @desc   Mark all my notifications as read
// @route  PATCH /api/notifications/read-all  (protected)
export const markAllRead = async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  return res.status(200).json({ message: "All marked as read." });
};
