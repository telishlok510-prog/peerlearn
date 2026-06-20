// Reusable PeerLearn logo: an SVG graduation-cap mark + wordmark.
// Props:
//   size  - height of the mark in px (default 30)
//   light - true on dark backgrounds (renders white text)
//   showText - set false to show only the mark
export default function Logo({ size = 30, light = false, showText = true }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" aria-label="PeerLearn logo">
        <defs>
          <linearGradient id="plg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="url(#plg)" />
        {/* mortarboard top */}
        <path d="M24 13 L37 19 L24 25 L11 19 Z" fill="#fff" />
        {/* cap base */}
        <path
          d="M16 22 L16 29 C16 31.2 19.6 33 24 33 C28.4 33 32 31.2 32 29 L32 22"
          stroke="#fff"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
        {/* tassel */}
        <line x1="37" y1="19" x2="37" y2="27" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="37" cy="28.5" r="1.8" fill="#fff" />
      </svg>

      {showText && (
        <span style={{ fontSize: size * 0.66, fontWeight: 800, letterSpacing: "-0.5px" }}>
          <span style={{ color: light ? "#fff" : "var(--text)" }}>Peer</span>
          <span style={{ color: light ? "#fff" : "var(--brand)" }}>Learn</span>
        </span>
      )}
    </span>
  );
}
