import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import Logo from "./Logo.jsx";

// The top navigation bar shown on all logged-in pages.
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  // Load the unread notification count (and refresh when the page changes).
  useEffect(() => {
    let active = true;
    api
      .get("/notifications/unread-count")
      .then((res) => active && setUnread(res.data.unread))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/dashboard", label: "Home" },
    { to: "/tutors", label: "Search Tutor" },
    { to: "/become-tutor", label: user?.isTutor ? "My Tutor Profile" : "Become Tutor" },
    { to: "/skill-exchange", label: "Skill Exchange" },
    { to: "/my-bookings", label: "My Bookings" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <div className="topbar">
      <Link to="/dashboard" className="logo" style={{ textDecoration: "none" }}>
        <Logo size={40} />
      </Link>

      {/* Hamburger button (shows only on mobile via CSS) */}
      <button
        className="nav-toggle"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className={`actions ${menuOpen ? "open" : ""}`}>
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            onClick={() => setMenuOpen(false)}
            style={{
              fontWeight: 600,
              color: location.pathname === l.to ? "var(--brand)" : "var(--text)",
              textDecoration: "none",
            }}
          >
            {l.label}
          </Link>
        ))}

        {/* Notification bell with unread badge */}
        <Link
          to="/notifications"
          onClick={() => setMenuOpen(false)}
          style={{ position: "relative", textDecoration: "none", fontSize: 20 }}
        >
          🔔
          {unread > 0 && (
            <span
              style={{
                position: "absolute",
                top: -6,
                right: -10,
                background: "var(--danger)",
                color: "#fff",
                borderRadius: "50%",
                fontSize: 11,
                fontWeight: 700,
                minWidth: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
              }}
            >
              {unread}
            </span>
          )}
        </Link>

        <span style={{ color: "var(--muted)" }}>{user?.fullName?.split(" ")[0]}</span>
        <button className="btn-outline" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
