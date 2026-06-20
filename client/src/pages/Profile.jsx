import { useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    branch: user?.branch || "",
    semester: user?.semester || "",
    bio: user?.bio || "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setSaving(true);
    try {
      const res = await api.patch("/auth/profile", form);
      setUser(res.data.user); // update app state with new info
      setMsg("Profile updated successfully!");
    } catch (error) {
      setErr(error.response?.data?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page" style={{ maxWidth: 560 }}>
        <h1>My Profile</h1>

        {msg && <div className="alert alert-success" style={{ marginTop: 12 }}>{msg}</div>}
        {err && <div className="alert alert-error" style={{ marginTop: 12 }}>{err}</div>}

        <div className="stat-card" style={{ marginTop: 16 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} required />
            </div>

            <div className="row">
              <div className="form-group">
                <label>Branch</label>
                <input name="branch" value={form.branch} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Semester</label>
                <select name="semester" value={form.semester} onChange={handleChange} required>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows="3"
                placeholder="A short intro about yourself"
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  border: "1px solid var(--border)",
                  borderRadius: 9,
                  fontFamily: "inherit",
                  fontSize: 15,
                }}
              />
            </div>

            {/* Read-only fields */}
            <div className="form-group">
              <label>College Email (read-only)</label>
              <input value={user?.email || ""} disabled style={{ background: "#f3f4f6" }} />
            </div>
            <div className="form-group">
              <label>Enrollment Number (read-only)</label>
              <input value={user?.enrollmentNumber || ""} disabled style={{ background: "#f3f4f6" }} />
            </div>

            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
