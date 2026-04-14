import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Doc Typography
const docH2 = { color: "#0F172A", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 12, marginTop: 28, letterSpacing: -0.5 };
const docH3 = { color: "#1E293B", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: 16, marginBottom: 8, marginTop: 20 };
const docP = { color: "rgba(15,23,42,0.7)", fontSize: 14, lineHeight: 1.75, fontFamily: "'Inter',sans-serif", marginBottom: 12 };
const docLi = { color: "rgba(15,23,42,0.7)", fontSize: 14, lineHeight: 1.75, fontFamily: "'Inter',sans-serif", marginBottom: 6, paddingLeft: 8 };

export function DocBtn({ children, variant = "primary", onClick }) {
  const [h, setH] = useState(false);
  const isPrimary = variant === "primary";
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: isPrimary ? `linear-gradient(135deg,#0A4A87,#07D1B2)` : "transparent",
      border: isPrimary ? "none" : "1px solid rgba(79,70,229,0.4)",
      color: isPrimary ? "#fff" : "#0A4A87", borderRadius: 8, padding: "9px 18px", fontSize: 13,
      fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif",
      transform: h ? "translateY(-2px)" : "none",
      boxShadow: h && isPrimary ? "0 0 24px rgba(79,70,229,0.5)" : "none",
      transition: "all 0.2s", marginRight: 8, marginTop: 4,
    }}>{children}</button>
  );
}

export function Badge({ children, color = "#22C55E" }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600, color, fontFamily: "'Inter',monospace", marginRight: 6 }}>{children}</span>;
}

export function DocsContent({ onClose, setModal }) {
  const navigate = useNavigate();
  return (
    <div>
      <p style={docP}>Welcome to the SentinelShield knowledge base. Our enterprise-grade platform ensures your organization's video content is securely moderated, optimized, and streamed with zero buffering.</p>

      <h2 style={docH2}>1. Getting Started</h2>
      <p style={docP}>SentinelShield allows you to instantly analyze and optimize video content before sharing it within your organization's library.</p>
      <ul style={{ listStyle: "none", margin: "0 0 16px", padding: 0 }}>
        {[["Supported Formats", ".mp4, .mov, .webm"], ["File Limits", "Maximum file size of 50MB"], ["Duration Limits", "Maximum video length of 60 seconds"], ["Daily Quota", "5 video processing tasks per user, per 24-hour period"]].map(([k, v]) => (
          <li key={k} style={{ ...docLi, display: "flex", gap: 8 }}>
            <span style={{ color: "#0A4A87", fontWeight: 600, minWidth: 130 }}>{k}:</span>
            <span>{v}</span>
          </li>
        ))}
      </ul>

      <h2 style={docH2}>2. The Processing Pipeline</h2>
      {[["Smart Extraction", "Our engine extracts keyframes at the 25%, 50%, and 75% marks of your video to ensure comprehensive coverage."], ["AI Moderation", "These frames are securely analyzed by our AI models to detect nudity, weapons, alcohol, drugs, and gore."], ["Web Optimization", "The video is re-encoded using FastStart (-movflags +faststart), ensuring instant playback on web browsers without buffering."], ["Secure Vaulting", "The optimized video is moved to our secure cloud storage, protected by expiring signed URLs."]].map(([title, desc], i) => (
        <div key={title} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#0A4A87,#07D1B2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "'Inter',monospace" }}>{i + 1}</div>
          <div><strong style={{ color: "#0F172A", fontSize: 14, fontFamily: "'Inter',sans-serif" }}>{title}:</strong> <span style={{ color: "rgba(15,23,42,0.7)", fontSize: 14, fontFamily: "'Inter',sans-serif" }}>{desc}</span></div>
        </div>
      ))}

      <h2 style={docH2}>3. Roles and Permissions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[{ role: "Standard User", color: "#0A4A87", perms: ["Upload videos", "View safe org videos", "Track processing status", "Cannot play flagged videos"] }, { role: "Administrator", color: "#05B096", perms: ["All Standard User permissions", "View flagged content (with warning)", "Permanently delete videos", "Review safety logs"] }].map(({ role, color, perms }) => (
          <div key={role} style={{ background: "rgba(15,23,42,0.03)", border: `1px solid ${color}33`, borderRadius: 12, padding: 16 }}>
            <div style={{ color, fontSize: 13, fontWeight: 700, fontFamily: "'Inter',sans-serif", marginBottom: 10 }}>{role}</div>
            {perms.map(p => <div key={p} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 5 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke={color} strokeWidth="2.5" strokeLinecap="round"/></svg><span style={{ color: "rgba(15,23,42,0.7)", fontSize: 13, fontFamily: "'Inter',sans-serif" }}>{p}</span></div>)}
          </div>
        ))}
      </div>

      <h2 style={docH2}>4. Understanding Safety Statuses</h2>
      <div style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 8 }}><Badge color="#22C55E">Safe</Badge> <span style={docP}>No sensitive content detected. Ready for organizational viewing.</span></div>
        <div style={{ marginBottom: 8 }}><Badge color="#EF4444">Flagged</Badge> <span style={docP}>Inappropriate content detected. Video is locked and restricted to Administrators only.</span></div>
        <div style={{ marginBottom: 8 }}><Badge color="#F59E0B">Failed</Badge> <span style={docP}>The file was corrupted, or the server timed out. You may safely retry the upload.</span></div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        <DocBtn onClick={() => { setModal(null); navigate("/login"); }}>View Organization Library</DocBtn>
        <DocBtn variant="secondary" onClick={() => setModal("support")}>Contact Support</DocBtn>
      </div>
    </div>
  );
}

export function PrivacyContent({ setModal }) {
  return (
    <div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(79,70,229,0.12)", border: "1px solid rgba(79,70,229,0.3)", borderRadius: 6, padding: "4px 12px", marginBottom: 16 }}>
        <span style={{ color: "#0A4A87", fontSize: 12, fontFamily: "'Inter',monospace" }}>Effective Date: April 2026</span>
      </div>
      <p style={docP}>At SentinelShield, we take your privacy and data security seriously. This Privacy Policy explains how we collect, use, and protect your information when you use our video processing and moderation platform.</p>

      {[["1. Information We Collect", [["Account Information", "Name, email address, organization ID, and role."], ["User Content", "Video files uploaded to our platform for processing."], ["Usage Data", "Upload frequency, daily API usage limits, and timestamp logs."]]],
        ["2. How We Process Your Data", [["Third-Party AI Processing", "To perform safety moderation, cryptographic hashes and temporary image frames of your video are securely transmitted to our AI partner (Sightengine). These frames are analyzed in real-time and are not used to train public AI models."], ["Ephemeral Processing", "Raw video files uploaded to our servers are processed in temporary, ephemeral storage. Once optimized and vaulted, local copies are permanently deleted."]]],
      ].map(([title, items]) => (
        <div key={title}>
          <h2 style={docH2}>{title}</h2>
          {(items).map(([k, v]) => (
            <div key={k} style={{ background: "rgba(15,23,42,0.03)", border: "1px solid rgba(15,23,42,0.08)", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
              <div style={{ color: "#0A4A87", fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif", marginBottom: 4 }}>{k}</div>
              <div style={{ color: "rgba(15,23,42,0.7)", fontSize: 13, lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>{v}</div>
            </div>
          ))}
        </div>
      ))}

      <h2 style={docH2}>3. Data Storage and Security</h2>
      <p style={docP}>Your optimized videos are stored in secure, encrypted cloud buckets (Supabase). Access is protected via temporary, cryptographically signed URLs that expire automatically. We implement industry-standard security measures to prevent unauthorized access.</p>
      <h2 style={docH2}>4. Data Retention</h2>
      <p style={docP}>We retain your videos and account data as long as your organization's account is active. Administrators may permanently delete individual videos at any time. Deleted videos are immediately scrubbed from our active cloud storage.</p>
      <div style={{ marginTop: 20 }}><DocBtn onClick={() => setModal("support-privacy")}>Contact Data Privacy Team</DocBtn></div>
    </div>
  );
}

export function TermsContent({ onAccept }) {
  const sections = [
    ["1. Acceptable Use", "You agree not to use SentinelShield to upload illegal, non-consensual, or highly malicious material; attempt to bypass file size (50MB), duration (60s), or rate limits (5 uploads/day); or reverse engineer, decompile, or attempt to extract the source code of our processing pipeline."],
    ["2. Service Availability and Limits", "SentinelShield is provided on an \"as is\" and \"as available\" basis. While we strive for 99.9% uptime, we reserve the right to throttle, suspend, or queue uploads during times of high network congestion to protect server stability."],
    ["3. Intellectual Property", "You retain all ownership rights to the videos you upload. By uploading content, you grant SentinelShield a limited, secure license to process, optimize, and store the video strictly for the purpose of providing the service to your organization."],
    ["4. Limitation of Liability", "While our AI moderation pipeline is highly accurate, artificial intelligence is not infallible. SentinelShield does not guarantee that 100% of inappropriate content will be flagged, nor that safe content will never be falsely flagged. We are not liable for damages arising from the failure to flag sensitive media."],
    ["5. Account Termination", "We reserve the right to suspend or terminate accounts that repeatedly violate these Terms, attempt to exploit our servers, or share API access credentials."],
  ];
  return (
    <div>
      <div style={{ display: "inline-flex", gap: 6, alignItems: "center", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 6, padding: "4px 12px", marginBottom: 16 }}>
        <span style={{ color: "#EF4444", fontSize: 12, fontFamily: "'Inter',monospace" }}>Last Updated: April 2026</span>
      </div>
      <p style={docP}>Please read these Terms of Service carefully before using SentinelShield. By using our platform, you agree to be bound by these terms.</p>
      {sections.map(([title, content]) => (
        <div key={title}>
          <h2 style={docH2}>{title}</h2>
          <p style={docP}>{content}</p>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 24, padding: "16px", background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.2)", borderRadius: 12 }}>
        <DocBtn onClick={onAccept}>I Accept the Terms</DocBtn>
        <DocBtn variant="secondary">Decline</DocBtn>
      </div>
    </div>
  );
}

export function SupportContent({ initialCategory = "" }) {
  const [ticket, setTicket] = useState({ type: initialCategory, msg: "", email: "" });
  const [sent, setSent] = useState(false);

  const categories = [
    { id: "tech", label: "Technical Support", desc: "Bugs, errors, failed processing", color: "#0A4A87", icon: "⚙️" },
    { id: "billing", label: "Billing & Limits", desc: "Plans, quotas, upgrades", color: "#07D1B2", icon: "💳" },
    { id: "privacy", label: "Data & Privacy", desc: "GDPR, data scrubbing, deletion", color: "#05B096", icon: "🔒" },
  ];

  const faqs = [
    ["Why did my video fail to upload?", "Ensure your video is under 50MB and exactly 60 seconds or less in duration."],
    ["Why is my video marked as flagged?", "Our AI detected sensitive imagery (weapons, nudity, or gore) in the 25%, 50%, or 75% keyframes. Contact your Organization Admin to review it."],
    ["How do I reset my daily limit?", "Limits automatically reset every 24 hours at midnight UTC."],
  ];

  if (sent) return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"/></svg>
      </div>
      <h3 style={{ ...docH3, textAlign: "center", fontSize: 20, color: "#22C55E" }}>Ticket Submitted!</h3>
      <p style={{ ...docP, textAlign: "center" }}>Our enterprise support team will respond within 4 hours (business hours). Check your email for a confirmation.</p>
      <DocBtn onClick={() => setSent(false)}>Submit Another</DocBtn>
    </div>
  );

  return (
    <div>
      <p style={docP}>Whether you're experiencing an upload issue, need to increase your daily limits, or have a question about our API, our enterprise support team is ready.</p>
      <h2 style={docH2}>Select Support Category</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
        {categories.map(c => (
          <div key={c.id} onClick={() => setTicket(t => ({ ...t, type: c.id }))} style={{
            background: ticket.type === c.id ? `${c.color}18` : "rgba(15,23,42,0.03)",
            border: `1px solid ${ticket.type === c.id ? c.color + "66" : "rgba(15,23,42,0.08)"}`,
            borderRadius: 12, padding: 14, cursor: "pointer",
            boxShadow: ticket.type === c.id ? `0 0 20px ${c.color}22` : "none",
            transition: "all 0.25s", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ color: ticket.type === c.id ? c.color : "#0F172A", fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif", marginBottom: 3 }}>{c.label}</div>
            <div style={{ color: "rgba(15,23,42,0.6)", fontSize: 11, fontFamily: "'Inter',sans-serif" }}>{c.desc}</div>
          </div>
        ))}
      </div>
      {ticket.type && (
        <div style={{ animation: "slideUpModal 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", color: "rgba(15,23,42,0.6)", fontSize: 12, fontFamily: "'Inter',sans-serif", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Your Email</label>
            <input value={ticket.email} onChange={e => setTicket(t => ({ ...t, email: e.target.value }))} placeholder="admin@yourorg.com" style={{ width: "100%", background: "rgba(15,23,42,0.03)", border: "1px solid rgba(15,23,42,0.12)", borderRadius: 8, padding: "10px 14px", color: "#0F172A", fontSize: 14, fontFamily: "'Inter',sans-serif", outline: "none", boxSizing: "border-box" }}/>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: "rgba(15,23,42,0.6)", fontSize: 12, fontFamily: "'Inter',sans-serif", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Describe Your Issue</label>
            <textarea value={ticket.msg} onChange={e => setTicket(t => ({ ...t, msg: e.target.value }))} placeholder="Describe the issue in detail..." rows={4} style={{ width: "100%", background: "rgba(15,23,42,0.03)", border: "1px solid rgba(15,23,42,0.12)", borderRadius: 8, padding: "10px 14px", color: "#0F172A", fontSize: 14, fontFamily: "'Inter',sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box" }}/>
          </div>
          <DocBtn onClick={() => ticket.email && ticket.msg && setSent(true)}>Submit Ticket →</DocBtn>
        </div>
      )}
      <h2 style={{ ...docH2, marginTop: 32 }}>Frequently Asked Questions</h2>
      {faqs.map(([q, a], i) => <FaqItem key={i} q={q} a={a} />)}
      <div style={{ marginTop: 24, background: "rgba(15,23,42,0.03)", border: "1px solid rgba(15,23,42,0.08)", borderRadius: 12, padding: 16 }}>
        <div style={{ color: "#0F172A", fontSize: 14, fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 8 }}>Direct Contact</div>
        <div style={{ ...docP, margin: 0 }}>📧 support@sentinelshield.ai &nbsp;|&nbsp; Mon–Fri, 9 AM–6 PM IST &nbsp;|&nbsp; <span style={{ color: "#0A4A87" }}>4-hour SLA for Enterprise customers</span></div>
      </div>
    </div>
  );
}

export function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 8, border: "1px solid rgba(15,23,42,0.08)", borderRadius: 10, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", background: open ? "rgba(79,70,229,0.08)" : "rgba(15,23,42,0.03)", border: "none", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "background 0.2s" }}>
        <span style={{ color: "#0F172A", fontSize: 14, fontFamily: "'Inter',sans-serif", fontWeight: 500, textAlign: "left" }}>{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(79,70,229,0.8)" strokeWidth="2" style={{ flexShrink: 0, transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)", transform: open ? "rotate(180deg)" : "none" }}><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && <div style={{ padding: "10px 16px 14px", background: "rgba(79,70,229,0.04)" }}><p style={{ ...docP, margin: 0 }}>{a}</p></div>}
    </div>
  );
}