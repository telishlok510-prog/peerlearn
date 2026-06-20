import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import Navbar from "../components/Navbar.jsx";

export default function TutorList() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    branch: "",
    semester: "",
    minRating: "",
    maxFee: "",
  });

  const fetchTutors = async () => {
    setLoading(true);
    try {
      // Build query string from non-empty filters.
      const params = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== "") params[k] = v;
      });
      const res = await api.get("/tutors", { params });
      setTutors(res.data.tutors);
    } catch {
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  // Load all tutors when the page first opens.
  useEffect(() => {
    fetchTutors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTutors();
  };

  return (
    <div>
      <Navbar />
      <div className="page">
        <h1>Find a Tutor</h1>

        {/* Search + filters */}
        <form onSubmit={handleSearch} className="stat-card" style={{ marginTop: 16 }}>
          <div className="form-group">
            <label>Search by subject, skill, or name</label>
            <input
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="e.g. Java, DBMS, Aarav"
            />
          </div>
          <div className="row">
            <div className="form-group">
              <label>Branch</label>
              <input name="branch" value={filters.branch} onChange={handleChange} placeholder="e.g. CSE" />
            </div>
            <div className="form-group">
              <label>Semester</label>
              <input type="number" name="semester" value={filters.semester} onChange={handleChange} placeholder="1-8" min="1" max="8" />
            </div>
          </div>
          <div className="row">
            <div className="form-group">
              <label>Min Rating</label>
              <input type="number" name="minRating" value={filters.minRating} onChange={handleChange} placeholder="0-5" min="0" max="5" step="0.5" />
            </div>
            <div className="form-group">
              <label>Max Fee (₹)</label>
              <input type="number" name="maxFee" value={filters.maxFee} onChange={handleChange} placeholder="e.g. 200" min="0" />
            </div>
          </div>
          <button className="btn" type="submit">Search</button>
        </form>

        {/* Results */}
        {loading ? (
          <p style={{ marginTop: 24, color: "var(--muted)" }}>Loading tutors...</p>
        ) : tutors.length === 0 ? (
          <p style={{ marginTop: 24, color: "var(--muted)" }}>
            No tutors found. Be the first — create your tutor profile!
          </p>
        ) : (
          <div className="cards" style={{ marginTop: 24 }}>
            {tutors.map((t) => (
              <div className="stat-card" key={t.id}>
                <h3>{t.fullName}</h3>
                <p style={{ color: "var(--muted)", fontSize: 14 }}>
                  {t.branch} · Sem {t.semester}
                </p>
                <p style={{ marginTop: 8, fontSize: 14 }}>
                  <strong>Subjects:</strong> {t.subjects.join(", ") || "—"}
                </p>
                <p style={{ fontSize: 14 }}>
                  <strong>Skills:</strong> {t.skills.join(", ") || "—"}
                </p>
                <p style={{ marginTop: 8 }}>
                  ⭐ {t.averageRating.toFixed(1)} ({t.totalReviews}) · ₹{t.feePerSession}/session
                </p>
                <Link to={`/tutors/${t.id}`}>
                  <button className="btn" style={{ marginTop: 12 }}>
                    View Profile
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
