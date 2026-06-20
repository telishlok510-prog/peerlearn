import { useState, useEffect } from "react";
import api from "../api/axios.js";
import Navbar from "../components/Navbar.jsx";

const LOCATIONS = ["Library", "Reading Room", "Study Area", "Canteen"];
const toList = (str) => str.split(",").map((s) => s.trim()).filter(Boolean);

export default function SkillExchange() {
  const [tab, setTab] = useState("marketplace");
  const [msg, setMsg] = useState("");

  // Profile state
  const [profile, setProfile] = useState({ canTeach: "", wantToLearn: "" });

  // Marketplace state
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  // Request form state (which student we're sending to)
  const [target, setTarget] = useState(null);
  const [reqForm, setReqForm] = useState({
    skillOffered: "",
    skillRequested: "",
    message: "",
    preferredDay: "",
    preferredTime: "",
    location: "Library",
  });

  // Requests state
  const [requests, setRequests] = useState([]);

  const loadProfile = async () => {
    const res = await api.get("/exchange/profile/me");
    const p = res.data.exchangeProfile || {};
    setProfile({
      canTeach: (p.canTeach || []).join(", "),
      wantToLearn: (p.wantToLearn || []).join(", "),
    });
  };

  const loadMarketplace = async () => {
    const res = await api.get("/exchange/marketplace", { params: search ? { search } : {} });
    setStudents(res.data.students);
  };

  const loadRequests = async () => {
    const res = await api.get("/exchange/requests");
    setRequests(res.data.requests);
  };

  useEffect(() => {
    loadProfile();
    loadMarketplace();
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/exchange/profile", {
        canTeach: toList(profile.canTeach),
        wantToLearn: toList(profile.wantToLearn),
      });
      setMsg("Exchange profile saved!");
      loadMarketplace();
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not save profile.");
    }
  };

  const openRequest = (student) => {
    setTarget(student);
    setReqForm({
      skillOffered: "",
      skillRequested: "",
      message: "",
      preferredDay: "",
      preferredTime: "",
      location: "Library",
    });
  };

  const sendRequest = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/exchange/requests", { toId: target.id, ...reqForm });
      setMsg("Exchange request sent!");
      setTarget(null);
      loadRequests();
      setTab("requests");
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not send request.");
    }
  };

  const updateStatus = async (id, status) => {
    setMsg("");
    try {
      const res = await api.patch(`/exchange/requests/${id}/status`, { status });
      setMsg(res.data.message);
      loadRequests();
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not update.");
    }
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

  return (
    <div>
      <Navbar />
      <div className="page">
        <h1>Skill Exchange</h1>
        <p style={{ color: "var(--muted)", marginTop: 4 }}>
          Trade skills with other students — no money involved.
        </p>

        {msg && <div className="alert alert-success" style={{ marginTop: 14 }}>{msg}</div>}

        <div style={{ display: "flex", gap: 6, borderBottom: "1px solid var(--border)", marginTop: 18 }}>
          {tabBtn("marketplace", "Marketplace")}
          {tabBtn("profile", "My Exchange Profile")}
          {tabBtn("requests", `Requests (${requests.length})`)}
        </div>

        {/* ---------- MARKETPLACE ---------- */}
        {tab === "marketplace" && (
          <div style={{ marginTop: 20 }}>
            <form onSubmit={(e) => { e.preventDefault(); loadMarketplace(); }} style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills or names (e.g. Java)"
                style={{ flex: 1, padding: "11px 13px", border: "1px solid var(--border)", borderRadius: 9 }}
              />
              <button className="btn" style={{ width: "auto", padding: "0 22px" }}>Search</button>
            </form>

            {students.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No students in the marketplace yet.</p>
            ) : (
              <div className="cards">
                {students.map((s) => (
                  <div className="stat-card" key={s.id}>
                    <h3>{s.fullName}</h3>
                    <p style={{ color: "var(--muted)", fontSize: 14 }}>{s.branch} · Sem {s.semester}</p>
                    <p style={{ marginTop: 8, fontSize: 14 }}><strong>Can teach:</strong> {s.canTeach.join(", ")}</p>
                    <p style={{ fontSize: 14 }}><strong>Wants to learn:</strong> {s.wantToLearn.join(", ")}</p>
                    <button className="btn" style={{ marginTop: 12 }} onClick={() => openRequest(s)}>
                      Send Exchange Request
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Request form (appears when a student is selected) */}
            {target && (
              <div className="stat-card" style={{ marginTop: 20, maxWidth: 560 }}>
                <h3>Request to {target.fullName}</h3>
                <form onSubmit={sendRequest}>
                  <div className="row">
                    <div className="form-group">
                      <label>Skill I Offer</label>
                      <input value={reqForm.skillOffered} onChange={(e) => setReqForm({ ...reqForm, skillOffered: e.target.value })} placeholder="e.g. Java" required />
                    </div>
                    <div className="form-group">
                      <label>Skill I Want</label>
                      <input value={reqForm.skillRequested} onChange={(e) => setReqForm({ ...reqForm, skillRequested: e.target.value })} placeholder="e.g. Graphic Design" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <input value={reqForm.message} onChange={(e) => setReqForm({ ...reqForm, message: e.target.value })} placeholder="Optional note" />
                  </div>
                  <div className="row">
                    <div className="form-group">
                      <label>Preferred Day</label>
                      <input value={reqForm.preferredDay} onChange={(e) => setReqForm({ ...reqForm, preferredDay: e.target.value })} placeholder="e.g. Saturday" />
                    </div>
                    <div className="form-group">
                      <label>Preferred Time</label>
                      <input value={reqForm.preferredTime} onChange={(e) => setReqForm({ ...reqForm, preferredTime: e.target.value })} placeholder="e.g. 3 PM" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <select value={reqForm.location} onChange={(e) => setReqForm({ ...reqForm, location: e.target.value })}>
                      {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn" type="submit" style={{ width: "auto", padding: "10px 20px" }}>Send</button>
                    <button type="button" className="btn-outline" onClick={() => setTarget(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ---------- MY PROFILE ---------- */}
        {tab === "profile" && (
          <div className="stat-card" style={{ marginTop: 20, maxWidth: 560 }}>
            <form onSubmit={saveProfile}>
              <div className="form-group">
                <label>I Can Teach (comma separated)</label>
                <input value={profile.canTeach} onChange={(e) => setProfile({ ...profile, canTeach: e.target.value })} placeholder="e.g. Java, DBMS" />
              </div>
              <div className="form-group">
                <label>I Want To Learn (comma separated)</label>
                <input value={profile.wantToLearn} onChange={(e) => setProfile({ ...profile, wantToLearn: e.target.value })} placeholder="e.g. Graphic Design" />
              </div>
              <button className="btn" type="submit">Save Exchange Profile</button>
            </form>
          </div>
        )}

        {/* ---------- REQUESTS ---------- */}
        {tab === "requests" && (
          <div style={{ marginTop: 20 }}>
            {requests.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No exchange requests yet.</p>
            ) : (
              requests.map((r) => (
                <div className="stat-card" key={r.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: r.direction === "incoming" ? "var(--brand)" : "var(--muted)" }}>
                        {r.direction === "incoming" ? "⬇ INCOMING" : "⬆ OUTGOING"}
                      </span>
                      <p style={{ marginTop: 4 }}>
                        <strong>{r.otherPerson.fullName}</strong> · {r.otherPerson.branch} Sem {r.otherPerson.semester}
                      </p>
                      <p style={{ fontSize: 14, marginTop: 4 }}>
                        Offers <strong>{r.skillOffered}</strong> ↔ Wants <strong>{r.skillRequested}</strong>
                      </p>
                      {r.message && <p style={{ fontSize: 14, color: "var(--muted)" }}>"{r.message}"</p>}
                      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                        📅 {r.preferredDay || "—"} · ⏰ {r.preferredTime || "—"} · 📍 {r.location}
                      </p>
                      {/* Contact shared only after acceptance */}
                      {(r.status === "Accepted" || r.status === "Completed") && r.otherPerson.email && (
                        <div style={{ marginTop: 8, padding: 10, background: "#f0fdf4", borderRadius: 8, fontSize: 14 }}>
                          <strong>Contact:</strong> {r.otherPerson.email} · Enroll: {r.otherPerson.enrollmentNumber}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 700 }}>{r.status}</span>
                      {r.direction === "incoming" && r.status === "Pending" && (
                        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                          <button className="btn" style={{ width: "auto", padding: "6px 14px" }} onClick={() => updateStatus(r.id, "Accepted")}>Accept</button>
                          <button className="btn-outline" onClick={() => updateStatus(r.id, "Rejected")}>Reject</button>
                        </div>
                      )}
                      {r.status === "Accepted" && (
                        <div>
                          <button className="btn-outline" style={{ marginTop: 8 }} onClick={() => updateStatus(r.id, "Completed")}>Mark Completed</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
