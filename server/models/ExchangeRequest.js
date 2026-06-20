import mongoose from "mongoose";

// One exchange request = student A offering a skill in return for another.
const exchangeRequestSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skillOffered: { type: String, required: true },
    skillRequested: { type: String, required: true },
    message: { type: String, default: "" },
    preferredDay: { type: String, default: "" },
    preferredTime: { type: String, default: "" },
    location: {
      type: String,
      enum: ["Library", "Reading Room", "Study Area", "Canteen"],
      default: "Library",
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const ExchangeRequest = mongoose.model("ExchangeRequest", exchangeRequestSchema);
export default ExchangeRequest;
