import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Logo from '../../assets/images/nav-logo.svg'; 
import { Modal } from '../../components/landing/AnimatedUI';
import { PrivacyContent, TermsContent, SupportContent } from '../../components/landing/LandingModals';

export default function AuthLayout() {
  const [modal, setModal] = useState(null);

  // Modal configuration mapping
  const modalConfig = {
    privacy: { title: "Privacy Policy", content: <PrivacyContent setModal={setModal} /> },
    terms:   { title: "Terms of Service", content: <TermsContent onAccept={() => setModal(null)} /> },
    support: { title: "SentinelShield - Support", content: <SupportContent /> },
    "support-privacy": { title: "SentinelShield - Support", content: <SupportContent initialCategory="privacy" /> },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-['Inter',sans-serif] relative overflow-hidden">
      
      {/* Background grid accent to match landing page */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "linear-gradient(#0A4A87 1px, transparent 1px), linear-gradient(90deg, #0A4A87 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 flex flex-col items-center relative z-10">
        <Link to="/" className="mb-6 outline-none hover:opacity-80 transition-opacity">
          <img src={Logo} alt="SentinelShield Logo" style={{ width: 160, height: 45, objectFit: "contain", background: "transparent" }} />
        </Link>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-[#0F172A] font-['Plus_Jakarta_Sans',sans-serif] tracking-[-0.5px]">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Secure your organization's media stream
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl transition-all duration-300 ease-in-out relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-[0_20px_40px_rgba(10,74,135,0.05)] border border-slate-100 rounded-2xl">
          {/* Nested routes render exactly here */}
          <Outlet />
        </div>
        
        {/* Footer legal/help links */}
        <div className="mt-8 flex justify-center space-x-6 text-xs text-slate-500 font-medium">
          <button onClick={() => setModal('privacy')} className="hover:text-[#07D1B2] transition-colors outline-none cursor-pointer">Privacy Policy</button>
          <button onClick={() => setModal('terms')} className="hover:text-[#07D1B2] transition-colors outline-none cursor-pointer">Terms of Service</button>
          <button onClick={() => setModal('support')} className="hover:text-[#07D1B2] transition-colors outline-none cursor-pointer">Contact Support</button>
        </div>
      </div>

      {/* Render Active Modals */}
      <div className="relative z-[9999]">
        {Object.entries(modalConfig).map(([key, { title, content }]) => (
          <Modal key={key} open={modal === key} onClose={() => setModal(null)} title={title}>
            {content}
          </Modal>
        ))}
      </div>
    </div>
  );
}