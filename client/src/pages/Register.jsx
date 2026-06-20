import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Holds whatever the user types in each field.
  const [form, setForm] = useState({
    fullName: "",
    enrollmentNumber: "",
    email: "",
    branch: "",
    semester: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Update one field when the user types.
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Quick checks before sending to the server.
    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      login(res.data.token, res.data.user); // log in immediately
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
          <Logo size={58} />
        </div>
        <div className="brand-tagline">Learn. Teach. Earn.</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="e.g. Aarav Sharma"
              required
            />
          </div>

          <div className="form-group">
            <label>Enrollment Number</label>
            <input
              name="enrollmentNumber"
              value={form.enrollmentNumber}
              onChange={handleChange}
              placeholder="e.g. EN2026001"
              required
            />
          </div>

          <div className="form-group">
            <label>College Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@college.edu"
              required
            />
          </div>

          <div className="row">
            <div className="form-group">
              <label>Branch</label>
              <input
                name="branch"
                value={form.branch}
                onChange={handleChange}
                placeholder="e.g. CSE"
                required
              />
            </div>
            <div className="form-group">
              <label>Semester</label>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              required
            />
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="switch-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
