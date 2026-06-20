import express from "express";
import {
  upsertExchangeProfile,
  getMyExchangeProfile,
  getMarketplace,
  sendExchangeRequest,
  getMyExchangeRequests,
  updateExchangeStatus,
} from "../controllers/exchangeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/profile", protect, upsertExchangeProfile);
router.get("/profile/me", protect, getMyExchangeProfile);
router.get("/marketplace", protect, getMarketplace);
router.post("/requests", protect, sendExchangeRequest);
router.get("/requests", protect, getMyExchangeRequests);
router.patch("/requests/:id/status", protect, updateExchangeStatus);

export default router;
