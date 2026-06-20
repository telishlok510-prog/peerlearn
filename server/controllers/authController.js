import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// A small helper to send back a consistent "safe" user object (no password).
const publicUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  enrollmentNumber: user.enrollmentNumber,
  email: user.email,
  branch: user.branch,
  semester: user.semester,
  bio: user.bio,
  profilePicture: user.profilePicture,
  isTutor: user.isTutor,
  role: user.role,
  status: user.status,
  tutorProfile: user.tutorProfile,
});

// @desc   Register a new student
// @route  POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { fullName, enrollmentNumber, email, branch, semester, password, confirmPassword } =
      req.body;

    // 1. Make sure all required fields are present.
    if (!fullName || !enrollmentNumber || !email || !branch || !semester || !password) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    // 2. Password rules: min 8 chars and must match confirmation.
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // 3. Prevent duplicate registrations (email or enrollment already used).
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    const enrollmentExists = await User.findOne({ enrollmentNumber });
    if (enrollmentExists) {
      return res.status(409).json({ message: "This enrollment number is already registered." });
    }

    // 4. Create the user (password gets hashed automatically by the model).
    const user = await User.create({
      fullName,
      enrollmentNumber,
      email,
      branch,
      semester,
      password,
    });

    // 5. Send back the user info + a fresh login token.
    return res.status(201).json({
      message: "Registration successful.",
      token: generateToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during registration.", error: error.message });
  }
};

// @desc   Log a student in
// @route  POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter both email and password." });
    }

    // Find the user AND include the password field (hidden by default).
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Block accounts removed by admin.
    if (user.status === "blocked") {
      return res.status(403).json({ message: "This account has been blocked." });
    }

    // Compare typed password with the stored hash.
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.status(200).json({
      message: "Login successful.",
      token: generateToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during login.", error: error.message });
  }
};

// @desc   Get the currently logged-in user's profile
// @route  GET /api/auth/me  (protected)
export const getMe = async (req, res) => {
  // req.user is attached by the auth middleware.
  return res.status(200).json({ user: publicUser(req.user) });
};

// @desc   Update editable profile fields (name, branch, semester, bio, picture)
// @route  PATCH /api/auth/profile  (protected)
export const updateProfile = async (req, res) => {
  try {
    const { fullName, branch, semester, bio, profilePicture } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Email and enrollment number are read-only — never changed here.
    if (fullName !== undefined) user.fullName = fullName;
    if (branch !== undefined) user.branch = branch;
    if (semester !== undefined) user.semester = semester;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();
    return res.status(200).json({ message: "Profile updated.", user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Server error updating profile.", error: error.message });
  }
};
