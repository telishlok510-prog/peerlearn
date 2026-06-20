import express from "express";
import { registerUser, loginUser, getMe, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser); // create a new account
router.post("/login", loginUser);       // log in
router.get("/me", protect, getMe);      // get my own profile (must be logged in)
router.patch("/profile", protect, updateProfile); // edit my profile

export default router;
