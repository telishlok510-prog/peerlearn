import express from "express";
import {
  upsertTutorProfile,
  getMyTutorProfile,
  listTutors,
  getTutorById,
} from "../controllers/tutorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listTutors);                       // public: search/list tutors
router.post("/profile", protect, upsertTutorProfile); // become/update tutor
router.get("/me", protect, getMyTutorProfile);     // my own tutor profile
router.get("/:id", getTutorById);                  // one tutor's public profile

export default router;
