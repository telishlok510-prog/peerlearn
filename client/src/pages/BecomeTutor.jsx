import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

export default function BecomeTutor() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    subjects: "",
    skills: "",
    experienceLevel: "Beginner",
    description: "",
    feePerSession: "",
    availableTime: "",
  });
  const [days, setDays] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // If the user is already a tutor, pre-fill the form with their info.
  useEffect(() => {
    if (user?.isTutor && user?.tutorProfile) {
      const t = user.tutorProfile;
      setForm({
        subjects: (t.subjects || []).join(", "),
        skills: (t.skills || []).join(", "),
        experienceLevel: t.experienceLevel || "Beginner",
        description: t.description || "",
        feePerSession: t.feePerSession || "",
        availableTime: t.availableTime || "",
      });
      setDays(t.availableDays || []);
    }
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleDay = (day) =>
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  // Turn "Java, DBMS" into ["Java", "DBMS"]
  const toList = (str) =>
    str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const subjects = toList(form.subjects);
    const skills = toList(form.skills);
    if (subjects.length === 0 && skills.length === 0) {
      return setError("Please add at least one subject or skill.");
    }

    setLoading(true);
    try {
      const res = await api.post("/tutors/profile", {
        subjects,
        skills,
        experienceLevel: form.experienceLevel,
        description: form.description,
        feePerSession: form.feePerSession,
        availableDays: days,
        availableTime: form.availableTime,
      });
      // Update the logged-in user so the app knows they're a tutor now.
      setUser({ ...user, isTutor: true, tutorProfile: res.data.tutorProfile });
      setSuccess("Tutor profile saved! Redirecting to your dashboard...");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page" style={{ maxWidth: 640 }}>
        <h1>{user?.isTutor ? "Edit Tutor Profile" : "Become a Tutor"}</h1>
        <p style={{ color: "var(--muted)", marginTop: 6, marginBottom: 24 }}>
          Share what you can teach. Your profile will appear in the tutor listing.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="stat-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Subjects (comma separated)</label>
              <input
                name="subjects"
                value={form.subjects}
                onChange={handleChange}
                placeholder="e.g. DBMS, Operating Systems"
              />
            </div>

            <div className="form-group">
              <label>Skills (comma separated)</label>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="e.g. Java, Graphic Design"
              />
            </div>

            <div className="row">
              <div className="form-group">
                <label>Experience Level</label>
                <select
                  name="experienceLevel"
                  value={form.experienceLevel}
                  onChange={handleChange}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Fee Per Session (₹)</label>
                <input
                  type="number"
                  name="feePerSession"
                  value={form.feePerSession}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Tell students about your teaching style and experience."
                rows="3"
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  border: "1px solid var(--border)",
                  borderRadius: "9px",
                  fontSize: "15px",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div className="form-group">
              <label>Available Days</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {DAYS.map((day) => (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      cursor: "pointer",
                      border: "1px solid var(--border)",
                      background: days.includes(day) ? "var(--brand)" : "#fff",
                      color: days.includes(day) ? "#fff" : "var(--text)",
                      fontWeight: 600,
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Available Time</label>
              <input
                name="availableTime"
                value={form.availableTime}
                onChange={handleChange}
                placeholder="e.g. 4 PM - 7 PM"
              />
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Tutor Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
