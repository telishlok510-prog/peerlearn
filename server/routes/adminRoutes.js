import express from "express";
import {
  getAdminStats,
  getAllUsers,
  getAllTutors,
  getAllBookings,
  getAllReviews,
  setUserBlocked,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Every admin route requires a logged-in admin.
router.use(protect, adminOnly);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.get("/tutors", getAllTutors);
router.get("/bookings", getAllBookings);
router.get("/reviews", getAllReviews);
router.patch("/users/:id/block", setUserBlocked);

export default router;
