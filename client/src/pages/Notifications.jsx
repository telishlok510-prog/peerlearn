import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import Navbar from "../components/Navbar.jsx";

const ICONS = { booking: "📅", review: "⭐", exchange: "🔄", info: "🔔" };

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setItems(res.data.notifications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    load();
  };

  // Format the time nicely (e.g. "2 hours ago").
  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} day(s) ago`;
  };

  return (
    <div>
      <Navbar />
      <div className="page" style={{ maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Notifications</h1>
          {items.some((n) => !n.read) && (
            <button className="btn-outline" onClick={markAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ color: "var(--muted)", marginTop: 16 }}>Loading...</p>
        ) : items.length === 0 ? (
          <p style={{ color: "var(--muted)", marginTop: 16 }}>
            No notifications yet.
          </p>
        ) : (
          <div style={{ marginTop: 16 }}>
            {items.map((n) => (
              <div
                key={n._id}
                onClick={() => n.link && navigate(n.link)}
                className="stat-card"
                style={{
                  marginBottom: 10,
                  cursor: n.link ? "pointer" : "default",
                  borderLeft: n.read ? "4px solid transparent" : "4px solid var(--brand)",
                  background: n.read ? "#fff" : "#f5f3ff",
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 22 }}>{ICONS[n.type] || "🔔"}</span>
                <div>
                  <div>{n.message}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    {timeAgo(n.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
