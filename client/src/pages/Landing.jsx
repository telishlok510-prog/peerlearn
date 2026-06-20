import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";

export default function Landing() {
  const features = [
    {
      icon: "💸",
      title: "Learn by Paying",
      text: "Book a tutor for any subject or skill. Pick a time and an on-campus spot, and learn at your own pace.",
    },
    {
      icon: "🎓",
      title: "Earn by Teaching",
      text: "Share what you're good at. Set your fee, accept bookings, and earn while building your confidence.",
    },
    {
      icon: "🔄",
      title: "Skill Exchange",
      text: "No money? No problem. Trade skills with other students — teach Java, learn design, all for free.",
    },
  ];

  const steps = [
    { n: "1", t: "Register", d: "Sign up with your college email." },
    { n: "2", t: "Find or Offer", d: "Search a tutor, become one, or list skills to exchange." },
    { n: "3", t: "Meet on Campus", d: "Book a session and meet in the library, study area, or canteen." },
    { n: "4", t: "Rate & Grow", d: "Leave reviews and build your reputation." },
  ];

  return (
    <div className="landing">
      {/* Top nav */}
      <header className="landing-nav">
        <Logo size={44} />
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/login"><button className="btn-outline">Login</button></Link>
          <Link to="/register"><button className="btn" style={{ width: "auto", padding: "8px 20px" }}>Sign Up</button></Link>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div style={{ marginBottom: 22 }}>
          <Logo size={78} light showText={false} />
        </div>
        <h1>Learn. Teach. Earn.</h1>
        <p className="hero-sub">
          A college-exclusive platform where students learn from students — through paid
          tutoring, skill exchange, and real, on-campus sessions.
        </p>
        <div className="hero-cta">
          <Link to="/register"><button className="btn" style={{ width: "auto", padding: "14px 32px", fontSize: 17 }}>Get Started — It's Free</button></Link>
          <Link to="/login"><button className="btn-outline" style={{ padding: "14px 32px", fontSize: 17 }}>I already have an account</button></Link>
        </div>
      </section>

      {/* Features */}
      <section className="landing-section">
        <h2>Three ways to grow</h2>
        <div className="feature-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section alt">
        <h2>How it works</h2>
        <div className="steps-grid">
          {steps.map((s) => (
            <div className="step" key={s.n}>
              <div className="step-num">{s.n}</div>
              <h4>{s.t}</h4>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-cta">
        <h2>Ready to start learning with your peers?</h2>
        <Link to="/register"><button className="btn" style={{ width: "auto", padding: "14px 36px", fontSize: 17 }}>Join PeerLearn</button></Link>
      </section>

      <footer className="landing-footer">
        <div style={{ marginBottom: 8 }}><Logo size={36} light /></div>
        Learn. Teach. Earn. · A Student-to-Student Learning Platform
      </footer>
    </div>
  );
}
