import User from "../models/User.js";

// Shapes a tutor record for public listing / profile views.
const publicTutor = (user) => ({
  id: user._id,
  fullName: user.fullName,
  branch: user.branch,
  semester: user.semester,
  bio: user.bio,
  profilePicture: user.profilePicture,
  subjects: user.tutorProfile?.subjects || [],
  skills: user.tutorProfile?.skills || [],
  experienceLevel: user.tutorProfile?.experienceLevel || "Beginner",
  description: user.tutorProfile?.description || "",
  feePerSession: user.tutorProfile?.feePerSession || 0,
  availableDays: user.tutorProfile?.availableDays || [],
  availableTime: user.tutorProfile?.availableTime || "",
  averageRating: user.tutorProfile?.averageRating || 0,
  totalReviews: user.tutorProfile?.totalReviews || 0,
  totalSessions: user.tutorProfile?.totalSessions || 0,
});

// @desc   Create or update the logged-in user's tutor profile
// @route  POST /api/tutors/profile  (protected)
export const upsertTutorProfile = async (req, res) => {
  try {
    const {
      subjects,
      skills,
      experienceLevel,
      description,
      feePerSession,
      availableDays,
      availableTime,
    } = req.body;

    // Must offer at least one subject or skill to be a tutor.
    const hasSubjects = Array.isArray(subjects) && subjects.length > 0;
    const hasSkills = Array.isArray(skills) && skills.length > 0;
    if (!hasSubjects && !hasSkills) {
      return res
        .status(400)
        .json({ message: "Please add at least one subject or skill." });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Update the tutor profile, keeping existing stats intact.
    user.isTutor = true;
    user.tutorProfile = {
      ...user.tutorProfile?.toObject?.(),
      subjects: subjects || [],
      skills: skills || [],
      experienceLevel: experienceLevel || "Beginner",
      description: description || "",
      feePerSession: Number(feePerSession) || 0,
      availableDays: availableDays || [],
      availableTime: availableTime || "",
    };

    await user.save();

    return res.status(200).json({
      message: "Tutor profile saved successfully.",
      tutorProfile: user.tutorProfile,
      isTutor: user.isTutor,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error saving tutor profile.", error: error.message });
  }
};

// @desc   Get the logged-in user's own tutor profile
// @route  GET /api/tutors/me  (protected)
export const getMyTutorProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  return res.status(200).json({
    isTutor: user.isTutor,
    tutorProfile: user.tutorProfile,
  });
};

// @desc   List / search tutors (public listing page)
// @route  GET /api/tutors
export const listTutors = async (req, res) => {
  try {
    const { search, branch, semester, minRating, maxFee } = req.query;

    // Base filter: only real tutors who are active.
    const filter = { isTutor: true, status: "active" };

    if (branch) filter.branch = branch;
    if (semester) filter.semester = Number(semester);
    if (minRating) filter["tutorProfile.averageRating"] = { $gte: Number(minRating) };
    if (maxFee) filter["tutorProfile.feePerSession"] = { $lte: Number(maxFee) };

    // Free-text search across subjects, skills, and name.
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { "tutorProfile.subjects": regex },
        { "tutorProfile.skills": regex },
        { fullName: regex },
      ];
    }

    const tutors = await User.find(filter).limit(100);
    return res.status(200).json({ tutors: tutors.map(publicTutor) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error listing tutors.", error: error.message });
  }
};

// @desc   Get one tutor's public profile
// @route  GET /api/tutors/:id
export const getTutorById = async (req, res) => {
  try {
    const tutor = await User.findOne({
      _id: req.params.id,
      isTutor: true,
      status: "active",
    });
    if (!tutor) return res.status(404).json({ message: "Tutor not found." });
    return res.status(200).json({ tutor: publicTutor(tutor) });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};
