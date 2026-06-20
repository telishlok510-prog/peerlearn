import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import Navbar from "../components/Navbar.jsx";
import StarRating from "../components/StarRating.jsx";

const LOCATIONS = ["Library", "Reading Room", "Study Area", "Canteen"];

export default function TutorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking form state
  const [showForm, setShowForm] = useState(false);
  const [booking, setBooking] = useState({ subject: "", date: "", time: "", location: "Library" });
  const [bookingMsg, setBookingMsg] = useState("");
  const [bookingErr, setBookingErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/tutors/${id}`)
      .then((res) => setTutor(res.data.tutor))
      .catch(() => setError("Tutor not found."))
      .finally(() => setLoading(false));

    // Load this tutor's reviews (public endpoint).
    api
      .get(`/reviews/tutor/${id}`)
      .then((res) => setReviews(res.data.reviews))
      .catch(() => setReviews([]));
  }, [id]);

  const handleBookingChange = (e) =>
    setBooking({ ...booking, [e.target.name]: e.target.value });

  const submitBooking = async (e) => {
    e.preventDefault();
    setBookingErr("");
    setBookingMsg("");
    setSubmitting(true);
    try {
      const res = await api.post("/bookings", { tutorId: id, ...booking });
      setBookingMsg(res.data.message);
      setShowForm(false);
      setTimeout(() => navigate("/my-bookings"), 1200);
    } catch (err) {
      setBookingErr(err.response?.data?.message || "Could not create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div>
        <Navbar />
        <div className="page">Loading...</div>
      </div>
    );

  if (error || !tutor)
    return (
      <div>
        <Navbar />
        <div className="page">
          <div className="alert alert-error">{error || "Tutor not found."}</div>
        </div>
      </div>
    );

  return (
    <div>
      <Navbar />
      <div className="page" style={{ maxWidth: 700 }}>
        <div className="stat-card">
          <h1>{tutor.fullName}</h1>
          <p style={{ color: "var(--muted)" }}>
            {tutor.branch} · Semester {tutor.semester}
          </p>
          <p style={{ marginTop: 8 }}>
            ⭐ {tutor.averageRating.toFixed(1)} ({tutor.totalReviews} reviews) ·{" "}
            {tutor.totalSessions} sessions taught
          </p>

          <hr style={{ margin: "18px 0", border: "none", borderTop: "1px solid var(--border)" }} />

          <p><strong>Subjects:</strong> {tutor.subjects.join(", ") || "—"}</p>
          <p><strong>Skills:</strong> {tutor.skills.join(", ") || "—"}</p>
          <p><strong>Experience:</strong> {tutor.experienceLevel}</p>
          <p><strong>Fee:</strong> ₹{tutor.feePerSession} per session</p>
          <p><strong>Available Days:</strong> {tutor.availableDays.join(", ") || "—"}</p>
          <p><strong>Available Time:</strong> {tutor.availableTime || "—"}</p>

          {tutor.description && (
            <>
              <h3 style={{ marginTop: 18 }}>About</h3>
              <p style={{ color: "var(--muted)" }}>{tutor.description}</p>
            </>
          )}

          {bookingMsg && <div className="alert alert-success" style={{ marginTop: 16 }}>{bookingMsg}</div>}
          {bookingErr && <div className="alert alert-error" style={{ marginTop: 16 }}>{bookingErr}</div>}

          {!showForm && (
            <button className="btn" style={{ marginTop: 20 }} onClick={() => setShowForm(true)}>
              Book Session
            </button>
          )}

          {showForm && (
            <form onSubmit={submitBooking} style={{ marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 18 }}>
              <h3 style={{ marginBottom: 12 }}>Book a Session</h3>

              <div className="form-group">
                <label>Subject / Skill</label>
                <select name="subject" value={booking.subject} onChange={handleBookingChange} required>
                  <option value="">Select what to learn</option>
                  {[...tutor.subjects, ...tutor.skills].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="row">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="date" value={booking.date} onChange={handleBookingChange} required />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input name="time" value={booking.time} onChange={handleBookingChange} placeholder="e.g. 4 PM - 5 PM" required />
                </div>
              </div>

              <div className="form-group">
                <label>Location</label>
                <select name="location" value={booking.location} onChange={handleBookingChange} required>
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn" type="submit" disabled={submitting}>
                  {submitting ? "Sending..." : "Send Request"}
                </button>
                <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="stat-card" style={{ marginTop: 18 }}>
          <h3>Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p style={{ color: "var(--muted)", marginTop: 8 }}>
              No reviews yet. Reviews appear here after completed sessions.
            </p>
          ) : (
            <div style={{ marginTop: 12 }}>
              {reviews.map((r) => (
                <div key={r._id} style={{ borderTop: "1px solid var(--border)", padding: "12px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{r.learner?.fullName || "Student"}</strong>
                    <StarRating value={r.rating} readOnly size={18} />
                  </div>
                  {r.feedback && (
                    <p style={{ color: "var(--muted)", marginTop: 4 }}>{r.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
