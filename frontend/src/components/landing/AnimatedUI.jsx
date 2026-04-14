import React, { useEffect, useRef } from "react";

export function Particles({ count = 25 }) {
  const particles = useRef(Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2 + 1, speed: Math.random() * 30 + 20,
    opacity: Math.random() * 0.3 + 0.1, delay: Math.random() * 15,
  }))).current;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, borderRadius: "50%",
          width: p.size, height: p.size,
          /* Deep Blue RGB: 10,74,135 | Bright Teal RGB: 7,209,178 */
background: `rgba(${Math.random() > 0.5 ? "10,74,135" : "7,209,178"},${p.opacity})`,
          animation: `floatUp ${p.speed}s ${p.delay}s linear infinite`,
          top: "110%",
        }}/>
      ))}
      <style>{`@keyframes floatUp { from{top:110%} to{top:-10%} }`}</style>
    </div>
  );
}

export function FadeIn({ children, delay = 0, y = 60, inView, duration = 1.2, className = "", style = {} }) {
  return (
    <div className={className} style={{
      ...style,
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0) scale(1)" : `translateY(${y}px) scale(0.98)`,
      transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
    }}>
      {children}
    </div>
  );
}

export function Modal({ open, onClose, children, title }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(15,23,42,0.5)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", animation: "fadeIn 0.3s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
        border: "1px solid rgba(79,70,229,0.2)", borderRadius: 24,
        width: "100%", maxWidth: 720, maxHeight: "88vh",
        overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 0 80px rgba(79,70,229,0.15), 0 40px 80px rgba(15,23,42,0.15)",
        animation: "slideUpModal 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid rgba(15,23,42,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#0A4A87,#07D1B2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <span style={{ color: "#0F172A", fontWeight: 700, fontSize: 18, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</span>
          </div>
          <button onClick={onClose} style={{ background: "rgba(15,23,42,0.03)", border: "1px solid rgba(15,23,42,0.08)", borderRadius: 8, width: 36, height: 36, cursor: "pointer", color: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(15,23,42,0.08)"; e.currentTarget.style.color = "#0F172A"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(15,23,42,0.03)"; e.currentTarget.style.color = "rgba(15,23,42,0.5)"; }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{ overflowY: "auto", padding: "28px", flex: 1, scrollbarWidth: "thin", scrollbarColor: "#0A4A87 transparent" }}>
          {children}
        </div>
      </div>
    </div>
  );
}