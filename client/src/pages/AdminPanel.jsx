import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("users");
  const [stats, setStats] = useState({ users: 0, tutors: 0, bookings: 0, reviews: 0 });
  const [users, setUsers] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [msg, setMsg] = useState("");

  const loadAll = async () => {
    try {
      const [s, u, t, b, r] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/tutors"),
        api.get("/admin/bookings"),
        api.get("/admin/reviews"),
      ]);
      setStats(s.data.stats);
      setUsers(u.data.users);
      setTutors(t.data.tutors);
      setBookings(b.data.bookings);
      setReviews(r.data.reviews);
    } catch {
      setMsg("Could not load admin data.");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const toggleBlock = async (id, blocked) => {
    setMsg("");
    try {
      const res = await api.patch(`/admin/users/${id}/block`, { blocked });
      setMsg(res.data.message);
      loadAll();
    } catch (err) {
      setMsg(err.response?.data?.message || "Action failed.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const tabBtn = (key, label) => (
    <button
      onClick={() => setTab(key)}
      style={{
        padding: "10px 18px",
        border: "none",
        borderBottom: tab === key ? "3px solid var(--brand)" : "3px solid transparent",
        background: "none",
        cursor: "pointer",
        fontWeight: 600,
        color: tab === key ? "var(--brand)" : "var(--muted)",
      }}
    >
      {label}
    </button>
  );

  const th = { textAlign: "left", padding: "10px 12px", borderBottom: "2px solid var(--border)", fontSize: 13, color: "var(--muted)" };
  const td = { padding: "10px 12px", borderBottom: "1px solid var(--border)", fontSize: 14 };

  return (
    <div>
      {/* Admin top bar */}
      <div className="topbar">
        <div className="logo" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Logo size={40} />
          <span style={{ color: "var(--muted)", fontWeight: 600, fontSize: 15 }}>· Admin</span>
        </div>
        <div className="actions">
          <span style={{ color: "var(--muted)" }}>{user?.fullName}</span>
          <button className="btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="page">
        <h1>Admin Panel</h1>
        {msg && <div className="alert alert-success" style={{ marginTop: 12 }}>{msg}</div>}

        {/* Summary cards */}
        <div className="cards" style={{ marginTop: 16 }}>
          <div className="stat-card"><div className="num">{stats.users}</div><div className="label">Total Users</div></div>
          <div className="stat-card"><div className="num">{stats.tutors}</div><div className="label">Tutors</div></div>
          <div className="stat-card"><div className="num">{stats.bookings}</div><div className="label">Bookings</div></div>
          <div className="stat-card"><div className="num">{stats.reviews}</div><div className="label">Reviews</div></div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, borderBottom: "1px solid var(--border)", marginTop: 24 }}>
          {tabBtn("users", "Users")}
          {tabBtn("tutors", "Tutors")}
          {tabBtn("bookings", "Bookings")}
          {tabBtn("reviews", "Reviews")}
        </div>

        <div className="stat-card" style={{ marginTop: 18, overflowX: "auto" }}>
          {/* USERS */}
          {tab === "users" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Name</th><th style={th}>Email</th><th style={th}>Enrollment</th>
                  <th style={th}>Branch</th><th style={th}>Sem</th><th style={th}>Status</th><th style={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={td}>{u.fullName}</td>
                    <td style={td}>{u.email}</td>
                    <td style={td}>{u.enrollmentNumber}</td>
                    <td style={td}>{u.branch}</td>
                    <td style={td}>{u.semester}</td>
                    <td style={{ ...td, color: u.status === "blocked" ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>{u.status}</td>
                    <td style={td}>
                      {u.status === "blocked" ? (
                        <button className="btn-outline" onClick={() => toggleBlock(u._id, false)}>Unblock</button>
                      ) : (
                        <button className="btn-outline" style={{ color: "var(--danger)" }} onClick={() => toggleBlock(u._id, true)}>Block</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TUTORS */}
          {tab === "tutors" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Name</th><th style={th}>Subjects</th><th style={th}>Skills</th>
                  <th style={th}>Fee</th><th style={th}>Rating</th><th style={th}>Sessions</th>
                </tr>
              </thead>
              <tbody>
                {tutors.map((t) => (
                  <tr key={t._id}>
                    <td style={td}>{t.fullName}</td>
                    <td style={td}>{(t.tutorProfile?.subjects || []).join(", ")}</td>
                    <td style={td}>{(t.tutorProfile?.skills || []).join(", ")}</td>
                    <td style={td}>₹{t.tutorProfile?.feePerSession || 0}</td>
                    <td style={td}>⭐ {t.tutorProfile?.averageRating || 0}</td>
                    <td style={td}>{t.tutorProfile?.totalSessions || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* BOOKINGS */}
          {tab === "bookings" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Learner</th><th style={th}>Tutor</th><th style={th}>Subject</th>
                  <th style={th}>Date</th><th style={th}>Location</th><th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td style={td}>{b.learner?.fullName || "—"}</td>
                    <td style={td}>{b.tutor?.fullName || "—"}</td>
                    <td style={td}>{b.subject}</td>
                    <td style={td}>{b.date}</td>
                    <td style={td}>{b.location}</td>
                    <td style={td}>{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* REVIEWS */}
          {tab === "reviews" && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Tutor</th><th style={th}>By</th><th style={th}>Rating</th><th style={th}>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r._id}>
                    <td style={td}>{r.tutor?.fullName || "—"}</td>
                    <td style={td}>{r.learner?.fullName || "—"}</td>
                    <td style={td}>{"★".repeat(r.rating)}</td>
                    <td style={td}>{r.feedback || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
