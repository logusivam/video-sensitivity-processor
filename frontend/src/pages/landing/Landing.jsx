import React, { useState, useEffect, useRef } from "react";
import { Modal } from "../../components/landing/AnimatedUI";
import { Preloader, Nav, Hero, FeatureTabs, HowItWorks, EnterpriseSection, CTA } from "../../components/landing/LandingSections";
import { DocsContent, PrivacyContent, TermsContent, SupportContent } from "../../components/landing/LandingModals";

export const Landing = () => {
  const [modal, setModal] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Momentum Smooth Scroll
  useEffect(() => {
    if (isLoading || isTouchDevice) {
      if (isLoading) document.body.style.overflow = "hidden";
      else document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "";
    const el = scrollRef.current;
    if (!el) return;

    let currentY = 0;
    let targetY = 0;
    let ease = 0.08; 
    let rafId;

    const updateScroll = () => {
      targetY = window.scrollY;
      currentY += (targetY - currentY) * ease;
      if (Math.abs(targetY - currentY) < 0.05) currentY = targetY;
      el.style.transform = `translate3d(0, -${currentY}px, 0)`;
      rafId = requestAnimationFrame(updateScroll);
    };
    rafId = requestAnimationFrame(updateScroll);

    const updateHeight = () => document.body.style.height = `${el.getBoundingClientRect().height}px`;
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(el);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      document.body.style.height = '';
    };
  }, [isLoading, isTouchDevice]);

  // 📌 UPDATED: Passed setModal and created the specific "support-privacy" state
  const modalConfig = {
    docs:    { title: "SentinelShield - Documentation", content: <DocsContent onClose={() => setModal(null)} setModal={setModal} /> },
    privacy: { title: "Privacy Policy", content: <PrivacyContent setModal={setModal} /> },
    terms:   { title: "Terms of Service", content: <TermsContent onAccept={() => { setTermsAccepted(true); setModal(null); }} /> },
    support: { title: "SentinelShield - Support", content: <SupportContent /> },
    "support-privacy": { title: "SentinelShield - Support", content: <SupportContent initialCategory="privacy" /> },
  };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", overflowX: "hidden", width: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#F8FAFC}
        ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:3px}
        ::-webkit-scrollbar-thumb:hover{background:#94A3B8}
        ::selection{background:rgba(10,74,135,0.25);color:#0F172A}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes pulseLogo{0%,100%{transform:scale(1);box-shadow:0 10px 40px rgba(10,74,135,0.2)}50%{transform:scale(1.05);box-shadow:0 15px 50px rgba(10,74,135,0.4)}}
      `}</style>

      <Preloader onComplete={() => setIsLoading(false)} />
      <Nav setModal={setModal} />

      {isTouchDevice ? (
        <div id="smooth-wrapper">
           <Hero setModal={setModal} />
           <FeatureTabs />
           <HowItWorks />
           <EnterpriseSection />
           <CTA setModal={setModal} />
        </div>
      ) : (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }}>
          <div ref={scrollRef} id="smooth-wrapper" style={{ width: "100%", willChange: "transform", pointerEvents: "auto" }}>
            <Hero setModal={setModal} />
            <FeatureTabs />
            <HowItWorks />
            <EnterpriseSection />
            <CTA setModal={setModal} />
          </div>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 9999 }}>
        {Object.entries(modalConfig).map(([key, { title, content }]) => (
          <Modal key={key} open={modal === key} onClose={() => setModal(null)} title={title}>
            {content}
          </Modal>
        ))}
        {termsAccepted && (
          <div onClick={() => setTermsAccepted(false)} style={{ position: "fixed", bottom: 28, right: 28, zIndex: 500, background: "#FFFFFF", border: "1px solid rgba(34,197,94,0.35)", borderRadius: 14, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)", boxShadow: "0 10px 30px rgba(15,23,42,0.1)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"/></svg>
            <span style={{ color: "#22C55E", fontSize: 14, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>Terms accepted — Welcome aboard!</span>
          </div>
        )}
      </div>
    </div>
  );
};