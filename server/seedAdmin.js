import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

// Run this once with:  npm run seed:admin
// It creates (or promotes) a single admin account.
dotenv.config();

const ADMIN = {
  fullName: "Platform Admin",
  enrollmentNumber: "ADMIN0001",
  email: "admin@college.edu",
  branch: "Administration",
  semester: 1,
  password: "admin12345", // change after first login (min 8 chars)
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  let admin = await User.findOne({ email: ADMIN.email });
  if (admin) {
    admin.role = "admin";
    await admin.save();
    console.log("✅ Existing account promoted to admin:", ADMIN.email);
  } else {
    admin = await User.create({ ...ADMIN, role: "admin" });
    console.log("✅ Admin account created:", ADMIN.email);
  }

  console.log("   Email:    ", ADMIN.email);
  console.log("   Password: ", ADMIN.password);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
