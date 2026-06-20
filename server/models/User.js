import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// This describes the shape of every "user" stored in the database.
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    enrollmentNumber: {
      type: String,
      required: [true, "Enrollment number is required"],
      unique: true, // no two students can share an enrollment number
      trim: true,
    },
    email: {
      type: String,
      required: [true, "College email is required"],
      unique: true, // no two students can share an email
      lowercase: true,
      trim: true,
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: 1,
      max: 8,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never return the password by default in queries
    },
    // Profile extras (editable later from the Profile page)
    profilePicture: { type: String, default: "" },
    bio: { type: String, default: "" },

    // Role flags. Every user is a learner; they become a tutor later.
    isTutor: { type: Boolean, default: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },

    status: { type: String, enum: ["active", "blocked"], default: "active" },

    // Filled in when the student becomes a tutor (Become Tutor module).
    tutorProfile: {
      subjects: { type: [String], default: [] },
      skills: { type: [String], default: [] },
      experienceLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
        default: "Beginner",
      },
      description: { type: String, default: "" },
      feePerSession: { type: Number, default: 0 },
      availableDays: { type: [String], default: [] },
      availableTime: { type: String, default: "" },

      // Stats updated automatically as the tutor teaches and gets reviewed.
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      totalSessions: { type: Number, default: 0 },
      earnings: { type: Number, default: 0 },
    },

    // Skill Exchange marketplace profile.
    exchangeProfile: {
      canTeach: { type: [String], default: [] },
      wantToLearn: { type: [String], default: [] },
      active: { type: Boolean, default: false },
    },
  },
  { timestamps: true } // automatically adds createdAt / updatedAt
);

// BEFORE saving a user, scramble (hash) the password so it is never
// stored as plain text. This runs only when the password changes.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper to check a typed password against the stored hash during login.
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
