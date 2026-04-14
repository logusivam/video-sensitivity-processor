import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalMouse, useMouseParallax, useInView, useTilt } from "../../hooks/useLandingAnimations";
import { Particles, FadeIn } from "./AnimatedUI";

// Logo imports
import navLogo from "../../assets/images/nav-logo.svg";
import footerLogo from "../../assets/images/footer.svg";
import preloaderLogo from "../../assets/images/footer.svg";

export const noiseSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

export function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 600); // Small wait before unmounting
          return 100;
        }
        return p + Math.random() * 18;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "#FFFFFF", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.6s",
      opacity: progress >= 100 ? 0 : 1,
      visibility: progress >= 100 ? "hidden" : "visible"
    }}>
      
      {/* 📌 New shadow-free pulse animation injected here */}
      <style>{`
        @keyframes cleanPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>

      {/* 📌 Swapped to cleanPulse and removed overflow:'hidden' so it doesn't clip */}
      <div style={{ width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center", animation: "cleanPulse 2s ease-in-out infinite", marginBottom: 28 }}>
        <img 
          src={preloaderLogo} 
          alt="Sentinel Shield Logo" 
          style={{ width: '100%', height: '100%', objectFit: "contain", background: "transparent" }} 
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Cpath d='M18 8L8 13l10 5 10-5-10-5zM8 23l10 5 10-5M8 18l10 5 10-5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"; 
          }} 
        />
      </div> 
      <div style={{ width: 220, height: 4, background: "rgba(15,23,42,0.06)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(progress, 100)}%`, background: "linear-gradient(90deg, #0A4A87, #07D1B2)", transition: "width 0.2s ease-out" }} />
      </div>
    </div>
  );
}

export function Nav({ setModal }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mouse = useGlobalMouse();
  const navigate = useNavigate();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navLinks = [
    { label: "Features", section: "features" },
    { label: "Pipeline", section: "pipeline" },
    { label: "Enterprise", section: "enterprise" },
    { label: "Docs", modal: "docs" },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setOpen(false);
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
      background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(15,23,42,0.06)" : "none",
      transition: "all 0.4s ease", fontFamily: "'Inter',sans-serif",
    }}>
      {scrolled && <div style={{ position: "absolute", left: mouse.x - 150, top: -20, width: 300, height: 60, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(79,70,229,0.08) 0%, transparent 70%)", pointerEvents: "none", transition: "left 0.1s ease" }}/>}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 68, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          
          <img 
            src={navLogo} 
            alt="Sentinel Shield Logo" 
            style={{ width: 140, height: 40, objectFit: "contain", background: "transparent" }} 
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Crect width='36' height='36' rx='10' fill='transparent'/%3E%3Cpath d='M18 8L8 13l10 5 10-5-10-5zM8 23l10 5 10-5M8 18l10 5 10-5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"; 
            }} 
          />
 
        </div>

        <div style={{ display: "flex", gap: 4, alignItems: "center" }} className="desktop-nav">
          {navLinks.map(({ label, section, modal }) => (
            <button key={label} onClick={() => modal ? setModal(modal) : scrollTo(section)} style={{ background: "none", border: "none", color: "rgba(15,23,42,0.6)", fontSize: 14, fontFamily: "'Inter',sans-serif", cursor: "pointer", padding: "8px 14px", borderRadius: 8, transition: "all 0.2s", position: "relative" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(15,23,42,0.06)"; e.currentTarget.style.color = "#0F172A"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(15,23,42,0.6)"; }}>
              {label}
            </button>
          ))}
          <div style={{ width: 1, height: 20, background: "rgba(15,23,42,0.12)", margin: "0 8px" }}/>
          <button onClick={() => setModal("support")} style={{ background: "rgba(15,23,42,0.03)", border: "1px solid rgba(15,23,42,0.15)", color: "rgba(15,23,42,0.7)", borderRadius: 8, padding: "8px 16px", fontSize: 14, cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(15,23,42,0.06)"; e.currentTarget.style.color = "#0F172A"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(15,23,42,0.03)"; e.currentTarget.style.color = "rgba(15,23,42,0.7)"; }}>
            Support
          </button>
          <button onClick={() => navigate("/login")} style={{ background: "linear-gradient(135deg,#0A4A87,#07D1B2)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 20px rgba(79,70,229,0.4)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 0 32px rgba(79,70,229,0.65)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 0 20px rgba(79,70,229,0.4)"; }}>
            Dashboard Login
          </button>
        </div>

        <button onClick={() => setOpen(!open)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "#0F172A", padding: 4 }} className="hamburger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M18 6L6 18M6 6l12 12"/> : <path d="M3 12h18M3 6h18M3 18h18"/>}
          </svg>
        </button>
      </div>

      {open && (
        <div style={{ background: "rgba(255,255,255,0.98)", borderTop: "1px solid rgba(15,23,42,0.06)", padding: "16px 24px 24px", animation: "slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          {navLinks.map(({ label, section, modal }) => (
            <div key={label} style={{ borderBottom: "1px solid rgba(15,23,42,0.06)" }}>
              <button onClick={() => { modal ? setModal(modal) : scrollTo(section); setOpen(false); }} style={{ background: "none", border: "none", width: "100%", textAlign: "left", color: "rgba(15,23,42,0.8)", fontSize: 16, fontFamily: "'Inter',sans-serif", cursor: "pointer", padding: "14px 0" }}>{label}</button>
            </div>
          ))}
          <button onClick={() => { setModal("docs"); setOpen(false); }} style={{ width: "100%", marginTop: 16, background: "linear-gradient(135deg,#0A4A87,#07D1B2)", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Get Started</button>
        </div>
      )}

      <style>{`
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
        @media(max-width:768px){.desktop-nav{display:none!important}.hamburger{display:flex!important}}
      `}</style>
    </nav>
  );
}

export function Scanner3D() {
  const { ref, pos } = useMouseParallax(15);
  const [phase, setPhase] = useState("idle");
  const [scanPct, setScanPct] = useState(0);
  const timer = useRef(null);

  const handleClick = () => {
    if (phase === "scanning") return;
    if (phase === "done") { setPhase("idle"); setScanPct(0); return; }
    setPhase("scanning"); setScanPct(0);
    let p = 0;
    timer.current = setInterval(() => {
      p += 2; setScanPct(p);
      if (p >= 100) { clearInterval(timer.current); setTimeout(() => setPhase("done"), 200); }
    }, 30);
  };

  return (
    <div ref={ref} onClick={handleClick} style={{ position: "relative", width: "100%", maxWidth: 460, perspective: 1200, cursor: phase === "scanning" ? "default" : "pointer" }}>
      {/* Updated Background Glow using Deep Blue RGB (10, 74, 135) */}
      <div style={{ position: "absolute", inset: -80, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(10,74,135,0.15) 0%, transparent 65%)", filter: "blur(50px)", pointerEvents: "none", transition: "opacity 0.5s", opacity: phase === "done" ? 0.4 : 1 }}/>
      
      <div style={{ transform: `rotateX(${pos.y}deg) rotateY(${pos.x}deg)`, transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)", transformStyle: "preserve-3d" }}>
        <div style={{
          background: "linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)",
          border: `1px solid ${phase === "done" ? "rgba(34,197,94,0.4)" : "rgba(7,209,178,0.3)"}`, // Idle border uses Teal
          borderRadius: 24, padding: "28px 28px 24px",
          boxShadow: `0 0 80px ${phase === "done" ? "rgba(34,197,94,0.15)" : "rgba(7,209,178,0.15)"}, 0 40px 60px rgba(15,23,42,0.08)`,
          position: "relative", overflow: "hidden", minHeight: 400,
          transition: "border-color 0.5s, box-shadow 0.5s",
        }}>
          {/* Updated Grid to Deep Blue */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "linear-gradient(rgba(10,74,135,1) 1px, transparent 1px), linear-gradient(90deg, rgba(10,74,135,1) 1px, transparent 1px)", backgroundSize: "28px 28px", animation: "gridPulse 4s ease-in-out infinite" }}/>
          
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
            {/* 📌 UPDATED: Glowing dot uses Bright Teal (#07D1B2) when scanning */}
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: phase === "done" ? "#22C55E" : phase === "scanning" ? "#07D1B2" : "#0A4A87", animation: phase === "scanning" ? "blink 0.8s infinite" : "none", boxShadow: phase === "scanning" ? "0 0 8px #07D1B2" : "none" }}/>
            <span style={{ color: "rgba(15,23,42,0.5)", fontSize: 11, fontFamily: "'Inter',monospace", letterSpacing: 2.5, textTransform: "uppercase" }}>
              {phase === "idle" ? "AI Scanner · Click Ready" : phase === "scanning" ? `Processing · ${Math.min(Math.round(scanPct), 100)}%` : "Analysis Complete · Safe"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{
              width: 120, height: 140, borderRadius: 14,
              // Updated inner box background gradients to Blue/Teal
              background: "linear-gradient(145deg, rgba(10,74,135,0.06) 0%, rgba(7,209,178,0.04) 100%)",
              border: `1px solid ${phase === "done" ? "rgba(34,197,94,0.5)" : "rgba(7,209,178,0.3)"}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
              position: "relative", overflow: "hidden",
              transform: phase === "scanning" ? "scale(0.96)" : "scale(1)",
              transition: "transform 0.4s ease, border-color 0.5s",
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={phase === "done" ? "#22C55E" : "#0A4A87"} strokeWidth="1.5"/>
                <path d="M14 2v6h6" stroke={phase === "done" ? "#22C55E" : "#0A4A87"} strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M10 11l4 2.5-4 2.5V11z" stroke={phase === "done" ? "#22C55E" : "#0A4A87"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {phase === "scanning" && (
                <div style={{
                  position: "absolute", left: -10, right: -10, height: 3,
                  // 📌 UPDATED: Laser box shadow now pops with Bright Teal (#07D1B2)
                  background: "linear-gradient(90deg, transparent, #0A4A87 30%, #07D1B2 70%, transparent)",
                  top: `${scanPct}%`, 
                  boxShadow: "0 0 16px #07D1B2",
                  transition: "top 0.04s linear",
                }}/>
              )}
            </div>
          </div>

          {phase === "done" ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.35)", borderRadius: 12, padding: "13px 20px", animation: "popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#22C55E" strokeWidth="1.5"/><path d="M9 12l2 2 4-4" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span style={{ color: "#22C55E", fontWeight: 700, fontSize: 14, fontFamily: "'Inter',sans-serif" }}>Optimized &amp; Safe ✓</span>
            </div>
          ) : (
            <div style={{ background: "rgba(15,23,42,0.08)", borderRadius: 8, overflow: "hidden", height: 5, marginTop: 10 }}>
              <div style={{ height: "100%", width: `${Math.min(scanPct, 100)}%`, background: "linear-gradient(90deg, #0A4A87, #07D1B2)", transition: "width 0.04s linear" }}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Hero({ setModal }) {
  const { ref, inView } = useInView(0.05);
  const navigate = useNavigate();

  return (
    <section ref={ref} id="hero" style={{ minHeight: "100vh", display: "flex", alignItems: "center", background: "#F8FAFC", position: "relative", overflow: "hidden", paddingTop: 80 }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: noiseSvg }}/>
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)", backgroundSize: "60px 60px", animation: "panGrid 40s linear infinite" }}/>
        <Particles count={25} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px", width: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 64, alignItems: "center" }} className="hero-grid">
          <div>
            <FadeIn inView={inView} delay={0.1} y={40}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(79,70,229,0.1)", border: "1px solid rgba(79,70,229,0.2)", borderRadius: 100, padding: "6px 16px", marginBottom: 28 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0A4A87", boxShadow: "0 0 8px #0A4A87", animation: "pulseDot 2s infinite" }}/>
                <span style={{ color: "#0A4A87", fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>SentinelShield is live</span>
              </div>
            </FadeIn>
            <FadeIn inView={inView} delay={0.2} y={40}>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(40px,5vw,68px)", fontWeight: 800, color: "#0F172A", lineHeight: 1.08, letterSpacing: -2.5, marginBottom: 24 }}>
                Enterprise-Grade<br/>
                <span style={{ background: "linear-gradient(135deg, #0A4A87 0%, #07D1B2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Video Moderation.
                </span>
              </h1>
            </FadeIn>
            <FadeIn inView={inView} delay={0.3} y={40}>
              <p style={{ color: "rgba(15,23,42,0.7)", fontSize: 18, lineHeight: 1.72, marginBottom: 40, fontFamily: "'Inter',sans-serif", maxWidth: 500 }}>
                Real-time AI scanning detecting weapons, gore, and explicit content before a single byte streams. FastStart-optimized for zero-buffer delivery.
              </p>
            </FadeIn>
            <FadeIn inView={inView} delay={0.4} y={40}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <button onClick={() => navigate("/login")} style={{ background: "linear-gradient(135deg,#0A4A87,#07D1B2)", color: "#fff", border: "none", borderRadius: 12, padding: "16px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter',sans-serif", boxShadow: "0 10px 30px -10px rgba(79,70,229,0.5)", transition: "all 0.3s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 20px 40px -10px rgba(79,70,229,0.6)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 10px 30px -10px rgba(79,70,229,0.5)"; }}>
                  Dashboard Login →
                </button>
                <button onClick={() => setModal("docs")} style={{ background: "transparent", color: "#0F172A", border: "1px solid rgba(15,23,42,0.15)", borderRadius: 12, padding: "16px 32px", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "all 0.3s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(15,23,42,0.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  View Documentation
                </button>
              </div>
            </FadeIn>
            <div style={{ display: "flex", gap: 36, marginTop: 44, flexWrap: "wrap" }}>
              {[["99.97%", "Detection Accuracy"], ["<2s", "Avg. Scan Time"], ["50MB", "Max File Size"]].map(([v, l], i) => (
                <FadeIn key={l} inView={inView} delay={0.5 + i * 0.12} y={30}>
                  <div style={{ color: "#0F172A", fontSize: 24, fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: -0.5 }} dangerouslySetInnerHTML={{ __html: v }}/>
                  <div style={{ color: "rgba(15,23,42,0.6)", fontSize: 13, fontFamily: "'Inter',sans-serif", marginTop: 2 }}>{l}</div>
                </FadeIn>
              ))}
            </div>
          </div>
          <FadeIn inView={inView} delay={0.5} y={60}>
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <Scanner3D />
            </div>
          </FadeIn>
        </div>
      </div>
      <style>{`
        @keyframes panGrid { 0% { background-position: 0 0; } 100% { background-position: 0 60px; } }
        @media(max-width:768px){
          .hero-grid{grid-template-columns:1fr!important; gap: 40px !important;}
          #hero { padding-top: 100px !important; padding-bottom: 60px !important; }
        }
      `}</style>
    </section>
  );
}

export function FeatureTabs() {
  const { ref, inView } = useInView(0.1);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: "streaming", label: "Zero-Buffer Delivery", title: "Optimized for Instant Web Playback", desc: "Our FastStart engine automatically rewrites the MP4 'moov' atom to the header of the file. This allows modern web browsers to begin video playback on the very first packet.", stat: "0.0s Wait Time", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id: "moderation", label: "Deep AI Moderation", title: "Real-time Safety Scanning", desc: "We integrate directly with specialized deep learning models to evaluate temporal frames. In less than two seconds, uploads are scanned for explicit imagery, excessive violence, weapons, and illicit substances before they hit your CDN.", stat: "99.97% Accuracy", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
    { id: "vault", label: "Cryptographic Vault", title: "Military-Grade Asset Protection", desc: "Clean media is vaulted inside encrypted S3 buckets. Direct access is impossible; assets can only be requested via cryptographically signed, short-lived URLs ensuring bad actors cannot scrape your organization's content.", stat: "AES-256 Encryption", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> }
  ];

  return (
    <section ref={ref} id="features" style={{ background: "#FFFFFF", padding: "120px 0", position: "relative" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <FadeIn inView={inView} delay={0.1}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#0F172A", letterSpacing: -1.5, marginBottom: 16 }}>Core Infrastructure</h2>
            <p style={{ color: "rgba(15,23,42,0.6)", fontSize: 18, maxWidth: 500, margin: "0 auto", fontFamily: "'Inter',sans-serif" }}>Explore the technology powering our high-performance media pipeline.</p>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 40 }} className="tab-grid">
          <FadeIn inView={inView} delay={0.2} className="tab-list">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tabs.map((tab, i) => {
                const isActive = activeTab === i;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(i)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 24px", background: isActive ? "linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(124,58,237,0.02) 100%)" : "transparent", border: `1px solid ${isActive ? "rgba(79,70,229,0.3)" : "rgba(15,23,42,0.05)"}`, borderRadius: 16, cursor: "pointer", transition: "all 0.3s ease", textAlign: "left" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: isActive ? "#0A4A87" : "rgba(15,23,42,0.05)", color: isActive ? "#fff" : "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}>{tab.icon}</div>
                    <span style={{ color: isActive ? "#0F172A" : "rgba(15,23,42,0.6)", fontWeight: 700, fontSize: 16, fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "color 0.3s ease" }}>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </FadeIn>
          <FadeIn inView={inView} delay={0.3} className="tab-content" style={{ position: "relative", height: "100%", minHeight: 340 }}>
            {tabs.map((tab, i) => (
              <div key={tab.id} className={`tab-panel ${activeTab === i ? 'active' : ''}`} style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)", border: "1px solid rgba(15,23,42,0.08)", borderRadius: 24, padding: 40, display: "flex", flexDirection: "column", justifyContent: "center", boxShadow: "0 20px 40px rgba(15,23,42,0.05)", opacity: activeTab === i ? 1 : 0, transform: activeTab === i ? "translateY(0)" : "translateY(20px)", pointerEvents: activeTab === i ? "auto" : "none", transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                <div style={{ display: "inline-flex", background: "rgba(79,70,229,0.1)", color: "#0A4A87", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: "'Inter',monospace", marginBottom: 24, width: "fit-content" }}>{tab.stat}</div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 28, fontWeight: 800, color: "#0F172A", marginBottom: 16, letterSpacing: -0.5 }}>{tab.title}</h3>
                <p style={{ color: "rgba(15,23,42,0.7)", fontSize: 16, lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>{tab.desc}</p>
              </div>
            ))}
          </FadeIn>
        </div>
      </div>
      <style>{`
        @media(max-width: 768px){
          .tab-grid{display:flex!important;flex-direction:column!important;gap:24px!important}
          .tab-content{position:relative!important;min-height:auto!important;}
          .tab-panel{position:relative!important;top:0!important;left:0!important;right:0!important;bottom:0!important;margin-bottom:16px;}
          .tab-panel:not(.active){display:none!important;}
        }
      `}</style>
    </section>
  );
}

export function HowItWorks() {
  const { ref, inView } = useInView(0.1);
  const pipelineSteps = [
    { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, title: "Secure Ingestion", subtitle: "Multer · 50MB / 60s Limits", desc: "Military-grade upload pipeline with strict file validation, rate limiting, and size constraints that reject malformed payloads before they reach the processing layer.", color: "#6366F1" },
    { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M8 21h8M12 17v4M9 8l3 2-3 2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, title: "Smart Frame Extraction", subtitle: "FFmpeg @ 25%, 50%, 75%", desc: "FFmpeg intelligently samples three representative keyframes at temporal quartiles, maximising content coverage while minimising compute cost.", color: "#8B5CF6" },
    { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M21 21l-4.35-4.35M11 8v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, title: "Sightengine AI Scan", subtitle: "Weapons · Gore · Nudity", desc: "Each frame is submitted to Sightengine's multi-category deep learning model for comprehensive threat detection across violence, explicit, and disturbing content vectors.", color: "#05B096" },
    { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, title: "FastStart Optimization", subtitle: "MP4 Rebuilt for Web", desc: "The moov atom is relocated to the file header so browsers can begin playback on the very first packet — zero buffering, zero waiting, instant streaming.", color: "#07D1B2" },
    { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><rect x="8" y="8" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>, title: "Supabase Vault", subtitle: "Signed URLs · Secure CDN", desc: "Clean assets are stored in Supabase's encrypted object storage with short-lived signed URLs — direct access to raw storage is impossible without a fresh token.", color: "#6D28D9" },
  ];

  const StepCard = ({ step }) => {
    const { ref, tilt } = useTilt(8);
    return (
      <div ref={ref} style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)", border: `1px solid rgba(15,23,42,0.06)`, borderRadius: 18, padding: "28px", maxWidth: "100%", width: "100%", boxShadow: "0 10px 30px rgba(15,23,42,0.04)", transform: `perspective(600px) rotateX(${tilt.x * 0.3}deg) rotateY(${tilt.y * 0.3}deg)`, transition: "transform 0.1s linear", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: `${step.color}15`, border: `1px solid ${step.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: step.color, flexShrink: 0 }}>{step.icon}</div>
          <div>
            <div style={{ color: "#0F172A", fontWeight: 800, fontSize: 18, fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: -0.5 }}>{step.title}</div>
            <div style={{ color: step.color, fontSize: 12, fontFamily: "'Inter',monospace", fontWeight: 600, marginTop: 4 }}>{step.subtitle}</div>
          </div>
        </div>
        <p style={{ color: "rgba(15,23,42,0.65)", fontSize: 15, lineHeight: 1.7, margin: 0, fontFamily: "'Inter',sans-serif" }}>{step.desc}</p>
      </div>
    );
  };

  return (
    <section ref={ref} id="pipeline" style={{ background: "#F8FAFC", padding: "120px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", position: "relative" }}>
        <FadeIn inView={inView} delay={0.1}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#0F172A", letterSpacing: -1.5, marginBottom: 16 }}>The Moderation Pipeline</h2>
            <p style={{ color: "rgba(15,23,42,0.6)", fontSize: 18, maxWidth: 540, margin: "0 auto", fontFamily: "'Inter',sans-serif" }}>A multi-stage automated workflow ensuring no harmful content reaches your audience.</p>
          </div>
        </FadeIn>
        <div className="pipeline-container" style={{ position: "relative", padding: "20px 0" }}>
          <div className="pipeline-line" style={{ position: "absolute", top: 0, bottom: 0, width: 2, background: "rgba(79,70,229,0.15)" }}/>
          <div style={{ display: "flex", flexDirection: "column", gap: 60 }}>
            {pipelineSteps.map((step, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div key={step.title} className="pipeline-row" style={{ display: "flex", alignItems: "center", position: "relative", width: "100%" }}>
                  <div className="pipeline-node" style={{ position: "absolute", width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${step.color}11, ${step.color}22)`, border: `2px solid ${step.color}44`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, boxShadow: `0 0 20px ${step.color}22` }}>
                    <span style={{ color: step.color, fontSize: 15, fontWeight: 800, fontFamily: "'Plus Jakarta Sans',monospace" }}>{i + 1}</span>
                  </div>
                  <div className="pipeline-content" style={{ width: "50%", display: "flex", justifyContent: isLeft ? "flex-end" : "flex-start", marginLeft: isLeft ? 0 : "50%", paddingRight: isLeft ? 60 : 0, paddingLeft: isLeft ? 0 : 60 }}>
                    <FadeIn inView={inView} delay={0.2 + i * 0.15} y={40} style={{ width: "100%", maxWidth: 440 }}>
                      <StepCard step={step} />
                    </FadeIn>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        .pipeline-line { left: 50%; transform: translateX(-50%); }
        .pipeline-node { left: 50%; transform: translate(-50%, 0); }
        @media(max-width:768px){
          .pipeline-line { left: 24px; transform: none; }
          .pipeline-node { left: 24px; transform: translate(-50%, 0); }
          .pipeline-row { margin-bottom: 32px; align-items: flex-start !important; }
          .pipeline-content { width: 100% !important; margin-left: 0 !important; padding-left: 84px !important; padding-right: 0 !important; justify-content: flex-start !important; }
        }
      `}</style>
    </section>
  );
}

export function EnterpriseSection() {
  const { ref, inView } = useInView(0.1);
  const features = [
    { title: "Concurrency Control", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, desc: "A custom queue system with priority scheduling prevents server overloads during traffic spikes — automatically throttling concurrent video jobs.", tag: "Queue System", size: "large", color: "#0A4A87", gridCol: "span 7" },
    { title: "Real-Time WebSockets", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: "Socket.io-powered live progress bars stream scan status to the client in real time — no polling, no page refreshes, no delays.", tag: "Socket.io", size: "small", color: "#07D1B2", gridCol: "span 5" },
    { title: "Role-Based Access", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, desc: "Admins can review and permanently delete flagged content. Standard users operate in a sandboxed environment.", tag: "RBAC", size: "small", color: "#8B5CF6", gridCol: "span 5" },
    { title: "API Rate Limiting", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, desc: "MongoDB-backed usage tracking enforces per-user and per-org rate limits with graceful degradation.", tag: "MongoDB", size: "large", color: "#6D28D9", gridCol: "span 7" },
  ];

  const FeatureCard = ({ feature }) => {
    const cardRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
    const [isHovered, setIsHovered] = useState(false);
    const handleMouseMove = (e) => { if (!cardRef.current) return; const rect = cardRef.current.getBoundingClientRect(); setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top }); };

    return (
      <div ref={cardRef} onMouseMove={handleMouseMove} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => { setIsHovered(false); setMousePos({ x: -1000, y: -1000 }); }} style={{ background: "#FFFFFF", border: "1px solid rgba(15,23,42,0.08)", borderRadius: 24, padding: feature.size === "large" ? 40 : 32, position: "relative", overflow: "hidden", cursor: "default", boxShadow: isHovered ? "0 20px 40px rgba(15,23,42,0.06)" : "0 4px 15px rgba(15,23,42,0.02)", transform: isHovered ? "translateY(-4px)" : "none", transition: "transform 0.4s ease, box-shadow 0.4s ease", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0, background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${feature.color}12, transparent 40%)`, opacity: isHovered ? 1 : 0, transition: "opacity 0.3s ease" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${feature.color}15`, border: `1px solid ${feature.color}30`, borderRadius: 8, padding: "6px 12px", marginBottom: 24 }}>
            <div style={{ color: feature.color }}>{feature.icon}</div>
            <span style={{ color: feature.color, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, fontFamily: "'Inter',sans-serif" }}>{feature.tag}</span>
          </div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: feature.size === "large" ? 26 : 20, color: "#0F172A", letterSpacing: -0.5, marginBottom: 12 }}>{feature.title}</h3>
          <p style={{ color: "rgba(15,23,42,0.65)", fontSize: 15, lineHeight: 1.7, fontFamily: "'Inter',sans-serif", margin: 0 }}>{feature.desc}</p>
        </div>
      </div>
    );
  };

  return (
    <section ref={ref} id="enterprise" style={{ background: "#F8FAFC", padding: "100px 0 140px", position: "relative" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <FadeIn inView={inView} delay={0.1}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#0F172A", letterSpacing: -1.5, marginBottom: 16 }}>Built for Enterprise Scale</h2>
            <p style={{ color: "rgba(15,23,42,0.6)", fontSize: 18, maxWidth: 500, margin: "0 auto", fontFamily: "'Inter',sans-serif" }}>Architectural decisions made with high-volume workloads in mind.</p>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 20 }} className="bento-grid">
          {features.map((f, i) => (
             <div key={f.title} style={{ gridColumn: f.gridCol }} className="bento-item">
               <FadeIn inView={inView} delay={0.2 + (i * 0.15)} y={60} style={{ height: "100%" }}><FeatureCard feature={f} /></FadeIn>
             </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:900px){.bento-grid{display:flex!important;flex-direction:column!important;gap:24px!important}}`}</style>
    </section>
  );
}

export function CTA({ setModal }) {
  const { ref, inView } = useInView(0.15);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <section ref={ref} id="cta" style={{ background: "#FFFFFF", paddingTop: 100, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(79,70,229,0.15) 0%, transparent 70%)", filter: "blur(80px)" }}/>
        <div style={{ position: "absolute", inset: 0, backgroundImage: noiseSvg }}/>
        <Particles count={20} />
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px", textAlign: "center", position: "relative", zIndex: 10 }}>
        <FadeIn inView={inView} delay={0.1} y={60}>
          <div style={{ width: 88, height: 88, borderRadius: 28, margin: "0 auto 36px", background: "linear-gradient(135deg,#0A4A87,#07D1B2)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 50px rgba(79,70,229,0.3)", animation: "float 4s ease-in-out infinite" }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        </FadeIn>
        <FadeIn inView={inView} delay={0.2} y={60}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(32px,5vw,56px)", fontWeight: 800, color: "#0F172A", letterSpacing: -2, marginBottom: 24, lineHeight: 1.1 }}>
            Secure Your Organization's<br/>
            <span style={{ background: "linear-gradient(135deg, #0A4A87, #07D1B2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Media Today.</span>
          </h2>
        </FadeIn>
        <FadeIn inView={inView} delay={0.3} y={60}>
          <p style={{ color: "rgba(15,23,42,0.65)", fontSize: 18, lineHeight: 1.7, margin: "0 auto 48px", fontFamily: "'Inter',sans-serif", maxWidth: 560 }}>
            Join leading enterprises using SentinelShield to protect their audiences, their brands, and their infrastructure.
          </p>
          <button onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => navigate("/login")} style={{ background: "linear-gradient(135deg,#0A4A87,#07D1B2)", color: "#fff", border: "none", borderRadius: 16, padding: "20px 48px", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: hovered ? "0 20px 40px rgba(79,70,229,0.4)" : "0 10px 30px rgba(79,70,229,0.2)", transform: hovered ? "translateY(-4px)" : "none", transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)", letterSpacing: -0.3 }}>
            Start Using the Dashboard →
          </button>
        </FadeIn>
      </div>

      <FadeIn inView={inView} delay={0.5} y={30}>
        <div style={{ maxWidth: 1100, margin: "120px auto 0", padding: "40px 24px", borderTop: "1px solid rgba(15,23,42,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24, position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src={footerLogo} alt="Sentinel Shield Logo" style={{ width: 60, height: 60, objectFit: "contain", background: "transparent" }} 
              onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Crect width='28' height='28' rx='8' fill='transparent'/%3E%3Cpath d='M14 6L6 11l8 5 8-5-8-5zM6 17l8 5 8-5M6 14l8 5 8-5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"; }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ color: "rgba(15,23,42,0.6)", fontSize: 14, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>© 2026 SentinelShield. All rights reserved.</span>
              <span style={{ color: "rgba(15,23,42,0.4)", fontSize: 12, fontFamily: "'Inter',sans-serif", letterSpacing: 0.5 }}>A logusivam vision</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["Privacy", "privacy"], ["Terms", "terms"], ["Docs", "docs"], ["Support", "support"]].map(([l, m]) => (
              <button key={l} onClick={() => setModal(m)} style={{ background: "none", border: "none", color: "rgba(15,23,42,0.5)", fontSize: 14, fontFamily: "'Inter',sans-serif", cursor: "pointer", padding: "8px 14px", borderRadius: 8, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#0F172A"; e.currentTarget.style.background = "rgba(15,23,42,0.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(15,23,42,0.5)"; e.currentTarget.style.background = "none"; }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </section>
  );
}