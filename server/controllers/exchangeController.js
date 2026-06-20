import ExchangeRequest from "../models/ExchangeRequest.js";
import User from "../models/User.js";
import { notify } from "../models/Notification.js";

const LOCATIONS = ["Library", "Reading Room", "Study Area", "Canteen"];

// @desc   Create / update my skill-exchange profile
// @route  POST /api/exchange/profile  (protected)
export const upsertExchangeProfile = async (req, res) => {
  try {
    const { canTeach, wantToLearn } = req.body;

    const hasTeach = Array.isArray(canTeach) && canTeach.length > 0;
    const hasLearn = Array.isArray(wantToLearn) && wantToLearn.length > 0;
    if (!hasTeach || !hasLearn) {
      return res.status(400).json({
        message: "Add at least one skill you can teach and one you want to learn.",
      });
    }

    const user = await User.findById(req.user._id);
    user.exchangeProfile = {
      canTeach,
      wantToLearn,
      active: true,
    };
    await user.save();

    return res.status(200).json({
      message: "Exchange profile saved.",
      exchangeProfile: user.exchangeProfile,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// @desc   Get my own exchange profile
// @route  GET /api/exchange/profile/me  (protected)
export const getMyExchangeProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  return res.status(200).json({ exchangeProfile: user.exchangeProfile });
};

// @desc   Browse other students in the marketplace
// @route  GET /api/exchange/marketplace  (protected)
export const getMarketplace = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {
      "exchangeProfile.active": true,
      status: "active",
      _id: { $ne: req.user._id }, // exclude myself
    };

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { "exchangeProfile.canTeach": regex },
        { "exchangeProfile.wantToLearn": regex },
        { fullName: regex },
      ];
    }

    const students = await User.find(filter).limit(100);
    const list = students.map((s) => ({
      id: s._id,
      fullName: s.fullName,
      branch: s.branch,
      semester: s.semester,
      canTeach: s.exchangeProfile?.canTeach || [],
      wantToLearn: s.exchangeProfile?.wantToLearn || [],
    }));
    return res.status(200).json({ students: list });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// @desc   Send an exchange request to another student
// @route  POST /api/exchange/requests  (protected)
export const sendExchangeRequest = async (req, res) => {
  try {
    const { toId, skillOffered, skillRequested, message, preferredDay, preferredTime, location } =
      req.body;

    if (!toId || !skillOffered || !skillRequested) {
      return res.status(400).json({ message: "Skill offered and requested are required." });
    }
    if (toId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot send a request to yourself." });
    }
    if (location && !LOCATIONS.includes(location)) {
      return res.status(400).json({ message: "Invalid location." });
    }

    const target = await User.findOne({ _id: toId, status: "active" });
    if (!target) return res.status(404).json({ message: "Student not found." });

    const request = await ExchangeRequest.create({
      from: req.user._id,
      to: toId,
      skillOffered,
      skillRequested,
      message: message || "",
      preferredDay: preferredDay || "",
      preferredTime: preferredTime || "",
      location: location || "Library",
    });

    // Notify the receiver about the new exchange request.
    await notify(
      toId,
      "exchange",
      `${req.user.fullName} sent you a skill exchange request.`,
      "/skill-exchange"
    );

    return res.status(201).json({ message: "Exchange request sent!", request });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Shapes a request, only revealing contact details once accepted/completed.
const shapeRequest = (r, meId) => {
  const shared = r.status === "Accepted" || r.status === "Completed";
  const other = r.from._id.toString() === meId ? r.to : r.from;
  return {
    id: r._id,
    direction: r.from._id.toString() === meId ? "outgoing" : "incoming",
    status: r.status,
    skillOffered: r.skillOffered,
    skillRequested: r.skillRequested,
    message: r.message,
    preferredDay: r.preferredDay,
    preferredTime: r.preferredTime,
    location: r.location,
    otherPerson: {
      id: other._id,
      fullName: other.fullName,
      branch: other.branch,
      semester: other.semester,
      // Contact only shared after acceptance.
      email: shared ? other.email : null,
      enrollmentNumber: shared ? other.enrollmentNumber : null,
    },
  };
};

// @desc   Get my exchange requests (incoming + outgoing)
// @route  GET /api/exchange/requests  (protected)
export const getMyExchangeRequests = async (req, res) => {
  const meId = req.user._id.toString();
  const requests = await ExchangeRequest.find({
    $or: [{ from: req.user._id }, { to: req.user._id }],
  })
    .populate("from", "fullName branch semester email enrollmentNumber")
    .populate("to", "fullName branch semester email enrollmentNumber")
    .sort({ createdAt: -1 });

  return res.status(200).json({ requests: requests.map((r) => shapeRequest(r, meId)) });
};

// @desc   Accept / reject / complete an exchange request
// @route  PATCH /api/exchange/requests/:id/status  (protected)
export const updateExchangeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Accepted", "Rejected", "Completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const request = await ExchangeRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found." });

    const meId = req.user._id.toString();
    const isReceiver = request.to.toString() === meId;
    const isSender = request.from.toString() === meId;
    if (!isReceiver && !isSender) {
      return res.status(403).json({ message: "Not your request." });
    }

    // Only the receiver can accept/reject a pending request.
    if (status === "Accepted" || status === "Rejected") {
      if (!isReceiver) {
        return res.status(403).json({ message: "Only the receiver can accept or reject." });
      }
      if (request.status !== "Pending") {
        return res.status(400).json({ message: "This request was already handled." });
      }
      request.status = status;

      // Notify the sender that their request was answered.
      await notify(
        request.from,
        "exchange",
        `Your skill exchange request was ${status.toLowerCase()}.`,
        "/skill-exchange"
      );
    }

    // Either party can mark an accepted exchange completed.
    if (status === "Completed") {
      if (request.status !== "Accepted") {
        return res.status(400).json({ message: "Only accepted exchanges can be completed." });
      }
      request.status = "Completed";
    }

    await request.save();
    return res.status(200).json({ message: `Request ${status.toLowerCase()}.` });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};
