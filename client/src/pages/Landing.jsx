import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, animate } from "framer-motion";
import Logo from "../components/Logo.jsx";
import "../landing.css";

/* Animated number counter that runs when scrolled into view. */
function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) => setVal(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

/* Wrapper that fades + slides content up when it enters the viewport. */
function Reveal({ children, delay = 0, y = 28 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

const NAV = [
  { label: "Home", href: "#top" },
  { label: "Find Tutors", href: "#tutors" },
  { label: "Skills Exchange", href: "#exchange" },
  { label: "Community", href: "#community" },
  { label: "Become Tutor", href: "#why" },
  { label: "About", href: "#how" },
  { label: "Contact", href: "#footer" },
];

export default function Landing() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("lp-theme") === "dark"
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [testi, setTesti] = useState(0);
  const [faqOpen, setFaqOpen] = useState(0);

  const testimonials = [
    { name: "Riya Mehta", role: "2nd Year · IT", text: "I was failing DBMS. A senior tutored me twice a week and I scored an A. Way cheaper than coaching, and right here on campus!", initials: "RM" },
    { name: "Karan Singh", role: "3rd Year · CSE", text: "I teach Java on PeerLearn and earn enough to cover my month's expenses. Teaching also made my own concepts crystal clear.", initials: "KS" },
    { name: "Ananya Roy", role: "1st Year · ECE", text: "I traded my graphic design skills to learn Python. No money, just a fair skill swap. PeerLearn made it so easy to find a match.", initials: "AR" },
  ];

  const faqs = [
    { q: "How do payments work?", a: "You agree on a per-session fee with your tutor up front. Sessions happen on campus, and earnings are tracked on each tutor's dashboard. Skill exchanges are completely free." },
    { q: "How does tutoring work?", a: "Search for a tutor by subject or skill, book a session with a date, time, and campus location, then meet in person. After the session you rate your tutor to help others." },
    { q: "How does verification work?", a: "Everyone signs up with a college email and enrollment number, so the whole community is verified students from your campus only." },
    { q: "Is PeerLearn only for college students?", a: "Yes — PeerLearn is exclusive to your college. This keeps the community safe, trusted, and focused on peer-to-peer learning on campus." },
  ];

  useEffect(() => {
    localStorage.setItem("lp-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className={`lp ${dark ? "dark" : ""}`} id="top">
      {/* ---------- Navbar ---------- */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Logo size={42} light={dark} />

          <div className="lp-nav-links">
            {NAV.map((n) => (
              <a key={n.label} href={n.href}>{n.label}</a>
            ))}
          </div>

          <div className="lp-nav-actions">
            <button className="lp-theme-toggle" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
              {dark ? "☀️" : "🌙"}
            </button>
            <Link to="/login"><button className="lp-btn lp-btn-ghost">Login</button></Link>
            <Link to="/register"><button className="lp-btn lp-btn-primary">Sign Up</button></Link>
            <button className="lp-burger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
        <div className={`lp-mobile-menu ${menuOpen ? "open" : ""}`}>
          {NAV.map((n) => (
            <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)}>{n.label}</a>
          ))}
          <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link to="/register" onClick={() => setMenuOpen(false)}>Sign Up</Link>
        </div>
      </nav>

      {/* ---------- Hero ---------- */}
      <section className="lp-hero">
        <div className="lp-container lp-hero-grid">
          <div>
            <motion.span
              className="lp-badge"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              🎓 Your college's learning community
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
            >
              Learn. Teach. <span className="lp-gradient-text">Earn.</span>
            </motion.h1>
            <motion.p
              className="lp-hero-sub"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Connect with talented students across your college. Learn subjects,
              share skills, and earn by teaching what you know.
            </motion.p>
            <motion.div
              className="lp-hero-cta"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <Link to="/register"><button className="lp-btn lp-btn-primary">🔍 Find a Tutor</button></Link>
              <Link to="/register"><button className="lp-btn lp-btn-accent">🎓 Become a Tutor</button></Link>
            </motion.div>
            <div className="lp-trust">
              <span>✅ Verified students</span>
              <span>📍 On-campus sessions</span>
              <span>⭐ 4.9 average rating</span>
            </div>
          </div>

          {/* Visual with floating cards */}
          <div className="lp-hero-visual">
            <motion.div
              className="lp-orb"
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="lp-orb-emoji">👩‍🎓👨‍🎓</div>
            </motion.div>

            <motion.div className="lp-float-card fc1" animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              <span className="ic" style={{ background: "#4f46e5" }}>💸</span> Earned ₹2,400
            </motion.div>
            <motion.div className="lp-float-card fc2" animate={{ y: [0, 12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              <span className="ic" style={{ background: "#06b6d4" }}>📚</span> DBMS · Booked
            </motion.div>
            <motion.div className="lp-float-card fc3" animate={{ y: [0, -10, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}>
              <span className="ic" style={{ background: "#f59e0b" }}>⭐</span> 4.9 Rating
            </motion.div>
            <motion.div className="lp-float-card fc4" animate={{ y: [0, 10, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}>
              <span className="ic" style={{ background: "#10b981" }}>🔄</span> Skill swap
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="lp-stats">
        <div className="lp-container lp-stats-grid">
          {[
            { to: 5000, suffix: "+", label: "Students" },
            { to: 500, suffix: "+", label: "Tutors" },
            { to: 100, suffix: "+", label: "Skills" },
            { to: 10000, suffix: "+", label: "Learning Sessions" },
          ].map((s) => (
            <div key={s.label}>
              <div className="lp-stat-num"><Counter to={s.to} suffix={s.suffix} /></div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="lp-section" id="how">
        <div className="lp-container">
          <div className="lp-grid-head">
            <span className="lp-kicker">Simple Process</span>
            <h2 className="lp-title">How PeerLearn Works</h2>
            <p className="lp-subtitle">From finding a tutor to earning by teaching — four easy steps.</p>
          </div>
          <div className="lp-steps">
            {[
              { ic: "🔍", t: "Search Tutor", d: "Find peers by subject, skill, fee, or rating." },
              { ic: "🤝", t: "Connect", d: "Book a session or send a skill-exchange request." },
              { ic: "📚", t: "Learn or Teach", d: "Meet on campus and share knowledge face to face." },
              { ic: "🚀", t: "Earn & Grow", d: "Get paid, collect reviews, and build your reputation." },
            ].map((s, i) => (
              <Reveal key={s.t} delay={i * 0.08}>
                <div className="lp-step">
                  <span className="lp-step-n">{i + 1}</span>
                  <div className="lp-step-ic">{s.ic}</div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Why choose ---------- */}
      <section className="lp-section soft" id="why">
        <div className="lp-container">
          <div className="lp-grid-head">
            <span className="lp-kicker">Why PeerLearn</span>
            <h2 className="lp-title">Built for how students actually learn</h2>
          </div>
          <div className="lp-cards-3">
            {[
              { ic: "💰", t: "Affordable Learning", d: "Peer rates are a fraction of coaching fees — learn more for less." },
              { ic: "✅", t: "Verified Students", d: "Everyone is a real, enrolled student from your own campus." },
              { ic: "🔄", t: "Skill Exchange", d: "Trade what you know for what you want to learn — no money needed." },
              { ic: "🗓️", t: "Flexible Scheduling", d: "Tutors set their own days and times that fit student life." },
              { ic: "🔒", t: "Secure & Trusted", d: "Contact details shared only after both sides agree." },
              { ic: "💬", t: "Community Support", d: "Ask questions, share notes, and study together." },
            ].map((f, i) => (
              <Reveal key={f.t} delay={(i % 3) * 0.08}>
                <div className="lp-feature">
                  <div className="lp-feature-ic">{f.ic}</div>
                  <h3>{f.t}</h3>
                  <p>{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Featured tutors ---------- */}
      <section className="lp-section" id="tutors">
        <div className="lp-container">
          <div className="lp-grid-head">
            <span className="lp-kicker">Top Rated</span>
            <h2 className="lp-title">Featured Tutors</h2>
            <p className="lp-subtitle">Learn from peers who've already mastered it.</p>
          </div>
          <div className="lp-tutors">
            {[
              { n: "Aarav S.", s: "CSE · Sem 5", sub: "Java, DSA, DBMS", price: "₹150", r: "4.9", in: "AS" },
              { n: "Priya P.", s: "IT · Sem 6", sub: "Python, ML", price: "₹200", r: "4.8", in: "PP" },
              { n: "Karan M.", s: "ECE · Sem 4", sub: "Maths, Circuits", price: "₹120", r: "4.7", in: "KM" },
              { n: "Sara K.", s: "Design · Sem 5", sub: "UI/UX, Figma", price: "₹180", r: "5.0", in: "SK" },
            ].map((t, i) => (
              <Reveal key={t.n} delay={(i % 4) * 0.07}>
                <div className="lp-tutor">
                  <div className="lp-tutor-top">
                    <div className="lp-tutor-avatar">{t.in}</div>
                  </div>
                  <div className="lp-tutor-body">
                    <h4>{t.n}</h4>
                    <div className="lp-tutor-sub">{t.s}</div>
                    <div style={{ fontSize: 13, color: "var(--lp-muted)", marginTop: 8 }}>{t.sub}</div>
                    <div className="lp-tutor-meta">
                      <span className="lp-tutor-rating">★ {t.r}</span>
                      <span className="lp-tutor-price">{t.price}/hr</span>
                    </div>
                    <Link to="/register"><button className="lp-btn lp-btn-primary">Book Session</button></Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Popular skills ---------- */}
      <section className="lp-section soft" id="exchange">
        <div className="lp-container">
          <div className="lp-grid-head">
            <span className="lp-kicker">Explore</span>
            <h2 className="lp-title">Popular Skills</h2>
          </div>
          <div className="lp-skills">
            {[
              { ic: "💻", n: "Programming" }, { ic: "🌐", n: "Web Development" },
              { ic: "📊", n: "Data Science" }, { ic: "➗", n: "Mathematics" },
              { ic: "🗣️", n: "English Speaking" }, { ic: "🎨", n: "Graphic Design" },
              { ic: "🎬", n: "Video Editing" }, { ic: "🎤", n: "Public Speaking" },
            ].map((s, i) => (
              <Reveal key={s.n} delay={(i % 4) * 0.05}>
                <div className="lp-skill"><span className="ic">{s.ic}</span>{s.n}</div>
              </Reveal>
            ))}
          </div>

          {/* Skill exchange example */}
          <div className="lp-cards-2" style={{ marginTop: 40 }}>
            <Reveal>
              <div className="lp-xchg">
                <div className="lp-xchg-row"><span className="lp-pill teach">I teach</span> Web Development</div>
                <div style={{ textAlign: "center", margin: "12px 0", fontSize: 22 }}>🔄</div>
                <div className="lp-xchg-row"><span className="lp-pill">I learn</span> Graphic Design</div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="lp-xchg">
                <div className="lp-xchg-row"><span className="lp-pill teach">I teach</span> Python &amp; ML</div>
                <div style={{ textAlign: "center", margin: "12px 0", fontSize: 22 }}>🔄</div>
                <div className="lp-xchg-row"><span className="lp-pill">I learn</span> Public Speaking</div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-grid-head">
            <span className="lp-kicker">Loved by students</span>
            <h2 className="lp-title">Student Testimonials</h2>
          </div>
          <motion.div
            key={testi}
            className="lp-testi-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ color: "var(--lp-accent)", fontSize: 20, marginBottom: 10 }}>★★★★★</div>
            <p className="lp-testi-quote">"{testimonials[testi].text}"</p>
            <div className="lp-testi-person">
              <div className="lp-testi-ava">{testimonials[testi].initials}</div>
              <div style={{ textAlign: "left" }}>
                <strong>{testimonials[testi].name}</strong>
                <div style={{ fontSize: 13, color: "var(--lp-muted)" }}>{testimonials[testi].role}</div>
              </div>
            </div>
          </motion.div>
          <div className="lp-testi-dots">
            {testimonials.map((_, i) => (
              <button key={i} className={`lp-dot ${i === testi ? "active" : ""}`} onClick={() => setTesti(i)} aria-label={`Testimonial ${i + 1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Success stories ---------- */}
      <section className="lp-section soft">
        <div className="lp-container">
          <div className="lp-grid-head">
            <span className="lp-kicker">Real Impact</span>
            <h2 className="lp-title">Success Stories</h2>
          </div>
          <div className="lp-cards-3">
            {[
              { ic: "💸", t: "₹18,000 earned", d: "by a 3rd-year tutor in one semester teaching DSA & Java." },
              { ic: "📈", t: "Grades improved", d: "200+ students raised their marks with peer tutoring." },
              { ic: "🤝", t: "1,000+ skill swaps", d: "students traded design, coding, and language skills for free." },
            ].map((s, i) => (
              <Reveal key={s.t} delay={i * 0.08}>
                <div className="lp-feature">
                  <div className="lp-feature-ic">{s.ic}</div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Community ---------- */}
      <section className="lp-section" id="community">
        <div className="lp-container">
          <div className="lp-grid-head">
            <span className="lp-kicker">More than tutoring</span>
            <h2 className="lp-title">Join the Community</h2>
            <p className="lp-subtitle">Learning is better together.</p>
          </div>
          <div className="lp-cards-3">
            {[
              { ic: "❓", t: "Ask Questions", d: "Stuck on a problem? Get answers from peers fast." },
              { ic: "📝", t: "Share Notes", d: "Upload and discover notes for your subjects." },
              { ic: "👥", t: "Study Groups", d: "Form groups and prep for exams together." },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 0.08}>
                <div className="lp-feature">
                  <div className="lp-feature-ic">{c.ic}</div>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="lp-section soft" id="faq">
        <div className="lp-container">
          <div className="lp-grid-head">
            <span className="lp-kicker">Questions?</span>
            <h2 className="lp-title">Frequently Asked Questions</h2>
          </div>
          <div className="lp-faq">
            {faqs.map((f, i) => (
              <div className="lp-faq-item" key={f.q}>
                <button className="lp-faq-q" onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}>
                  {f.q}
                  <span>{faqOpen === i ? "−" : "+"}</span>
                </button>
                {faqOpen === i && <div className="lp-faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA band ---------- */}
      <section style={{ padding: "30px 0 70px" }}>
        <div className="lp-cta-band">
          <h2>Ready to learn with your peers?</h2>
          <p style={{ opacity: 0.92, margin: "14px 0 26px", fontSize: 17 }}>
            Join your college's learning community in under a minute.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register"><button className="lp-btn lp-btn-accent">Get Started Free</button></Link>
            <Link to="/login"><button className="lp-btn lp-btn-ghost" style={{ color: "#fff", background: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.4)" }}>Login</button></Link>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="lp-footer" id="footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div>
              <Logo size={28} light={dark} />
              <p style={{ marginTop: 12, maxWidth: 260 }}>
                A student-to-student learning platform. Learn subjects, share skills, and earn by teaching.
              </p>
              <div className="lp-social">
                <a href="#top" aria-label="Twitter">𝕏</a>
                <a href="#top" aria-label="Instagram">📷</a>
                <a href="#top" aria-label="LinkedIn">in</a>
              </div>
            </div>
            <div>
              <h5>Platform</h5>
              <a href="#tutors">Find Tutors</a>
              <a href="#exchange">Skills Exchange</a>
              <a href="#community">Community</a>
              <Link to="/register">Become a Tutor</Link>
            </div>
            <div>
              <h5>Company</h5>
              <a href="#how">About</a>
              <a href="#footer">Contact</a>
              <a href="#faq">FAQ</a>
            </div>
            <div>
              <h5>Legal</h5>
              <a href="#top">Privacy Policy</a>
              <a href="#top">Terms &amp; Conditions</a>
            </div>
          </div>
          <div className="lp-footer-bottom">
            © 2026 PeerLearn · Learn. Teach. Earn.
          </div>
        </div>
      </footer>
    </div>
  );
}
