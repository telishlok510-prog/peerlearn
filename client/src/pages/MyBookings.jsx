import { useState, useEffect } from "react";
import api from "../api/axios.js";
import Navbar from "../components/Navbar.jsx";
import StarRating from "../components/StarRating.jsx";

// Small coloured badge for the booking status.
function StatusBadge({ status }) {
  const colors = {
    Pending: "#d97706",
    Accepted: "#2563eb",
    Rejected: "#dc2626",
    Completed: "#16a34a",
  };
  return (
    <span style={{ color: colors[status] || "#555", fontWeight: 700 }}>
      {status}
    </span>
  );
}

export default function MyBookings() {
  const [myBookings, setMyBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Review state
  const [reviewedIds, setReviewedIds] = useState([]);
  const [activeReview, setActiveReview] = useState(null); // bookingId being reviewed
  const [reviewData, setReviewData] = useState({ rating: 0, feedback: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [mine, reqs, reviewed] = await Promise.all([
        api.get("/bookings/my"),
        api.get("/bookings/requests"),
        api.get("/reviews/mine"),
      ]);
      setMyBookings(mine.data.bookings);
      setRequests(reqs.data.bookings);
      setReviewedIds(reviewed.data.bookingIds.map((id) => id.toString()));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Tutor accepts/rejects, or either party completes.
  const updateStatus = async (id, status) => {
    setMsg("");
    try {
      const res = await api.patch(`/bookings/${id}/status`, { status });
      setMsg(res.data.message);
      load(); // refresh lists
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not update.");
    }
  };

  const submitReview = async (bookingId) => {
    setMsg("");
    if (reviewData.rating < 1) {
      setMsg("Please select a star rating.");
      return;
    }
    try {
      const res = await api.post("/reviews", { bookingId, ...reviewData });
      setMsg(res.data.message);
      setActiveReview(null);
      setReviewData({ rating: 0, feedback: "" });
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not submit review.");
    }
  };

  if (loading)
    return (
      <div>
        <Navbar />
        <div className="page">Loading...</div>
      </div>
    );

  return (
    <div>
      <Navbar />
      <div className="page">
        <h1>My Bookings</h1>
        {msg && <div className="alert alert-success" style={{ marginTop: 12 }}>{msg}</div>}

        {/* As a learner */}
        <h2 style={{ marginTop: 24 }}>Sessions I Booked</h2>
        {myBookings.length === 0 ? (
          <p style={{ color: "var(--muted)", marginTop: 8 }}>
            You haven't booked any sessions yet. Find a tutor to get started!
          </p>
        ) : (
          <div style={{ marginTop: 12 }}>
            {myBookings.map((b) => (
              <div className="stat-card" key={b._id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <strong>{b.subject}</strong> with{" "}
                    {b.tutor?.fullName || "Tutor"}
                    <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
                      📅 {b.date} · ⏰ {b.time} · 📍 {b.location} · ₹{b.fee}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <StatusBadge status={b.status} />
                    {b.status === "Accepted" && (
                      <div>
                        <button
                          className="btn-outline"
                          style={{ marginTop: 8 }}
                          onClick={() => updateStatus(b._id, "Completed")}
                        >
                          Mark Completed
                        </button>
                      </div>
                    )}
                    {b.status === "Completed" && !reviewedIds.includes(b._id.toString()) && activeReview !== b._id && (
                      <div>
                        <button
                          className="btn-outline"
                          style={{ marginTop: 8 }}
                          onClick={() => { setActiveReview(b._id); setReviewData({ rating: 0, feedback: "" }); }}
                        >
                          Leave Review
                        </button>
                      </div>
                    )}
                    {b.status === "Completed" && reviewedIds.includes(b._id.toString()) && (
                      <div style={{ marginTop: 8, color: "var(--success)", fontSize: 13, fontWeight: 600 }}>
                        ✓ Reviewed
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline review form */}
                {activeReview === b._id && (
                  <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Your Rating</label>
                    <StarRating
                      value={reviewData.rating}
                      onChange={(r) => setReviewData({ ...reviewData, rating: r })}
                    />
                    <textarea
                      value={reviewData.feedback}
                      onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                      placeholder="Share your feedback (optional)"
                      rows="2"
                      style={{
                        width: "100%",
                        marginTop: 10,
                        padding: "10px 12px",
                        border: "1px solid var(--border)",
                        borderRadius: 9,
                        fontFamily: "inherit",
                        fontSize: 14,
                      }}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button className="btn" style={{ width: "auto", padding: "8px 18px" }} onClick={() => submitReview(b._id)}>
                        Submit Review
                      </button>
                      <button className="btn-outline" onClick={() => setActiveReview(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* As a tutor */}
        <h2 style={{ marginTop: 32 }}>Requests To Me (as Tutor)</h2>
        {requests.length === 0 ? (
          <p style={{ color: "var(--muted)", marginTop: 8 }}>
            No booking requests yet.
          </p>
        ) : (
          <div style={{ marginTop: 12 }}>
            {requests.map((b) => (
              <div className="stat-card" key={b._id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <strong>{b.subject}</strong> requested by{" "}
                    {b.learner?.fullName || "Student"}
                    <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
                      📅 {b.date} · ⏰ {b.time} · 📍 {b.location} · ₹{b.fee}
                    </p>
                    {b.status === "Accepted" && b.learner?.email && (
                      <p style={{ fontSize: 14 }}>📧 {b.learner.email}</p>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <StatusBadge status={b.status} />
                    {b.status === "Pending" && (
                      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                        <button className="btn" style={{ width: "auto", padding: "6px 14px" }} onClick={() => updateStatus(b._id, "Accepted")}>
                          Accept
                        </button>
                        <button className="btn-outline" onClick={() => updateStatus(b._id, "Rejected")}>
                          Reject
                        </button>
                      </div>
                    )}
                    {b.status === "Accepted" && (
                      <div>
                        <button className="btn-outline" style={{ marginTop: 8 }} onClick={() => updateStatus(b._id, "Completed")}>
                          Mark Completed
                        </button>
                      </div>
                    )}
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
