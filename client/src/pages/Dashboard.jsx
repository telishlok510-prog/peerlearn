import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingSessions: 0,
    pendingRequests: 0,
    reviewsReceived: 0,
  });

  // Load the live numbers from the backend when the page opens.
  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => setStats(res.data.stats))
      .catch(() => {});
  }, []);

  const cards = [
    { label: "Total Bookings", num: stats.totalBookings },
    { label: "Upcoming Sessions", num: stats.upcomingSessions },
    { label: "Pending Requests", num: stats.pendingRequests },
    { label: "Reviews Received", num: stats.reviewsReceived },
  ];

  const actions = [
    { to: "/tutors", label: "🔍 Search Tutor" },
    { to: "/become-tutor", label: user?.isTutor ? "✏️ Edit Tutor Profile" : "🎓 Become a Tutor" },
    { to: "/skill-exchange", label: "🔄 Skill Exchange" },
    { to: "/my-bookings", label: "📅 My Bookings" },
    { to: "/profile", label: "👤 My Profile" },
  ];

  return (
    <div>
      <Navbar />

      <div className="page">
        <h1>Welcome back, {user?.fullName}!</h1>
        <p style={{ color: "var(--muted)", marginTop: 6 }}>
          {user?.branch} · Semester {user?.semester} · {user?.email}
        </p>

        <div className="cards">
          {cards.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="num">{s.num}</div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: 36 }}>Quick Actions</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 14 }}>
          {actions.map((a) => (
            <Link key={a.to} to={a.to}>
              <button className="btn-outline" style={{ padding: "12px 20px" }}>
                {a.label}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
