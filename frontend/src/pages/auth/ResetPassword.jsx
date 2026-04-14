import { useState, useEffect } from 'react';
import { Lock, AlertCircle, Check } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';

// Import Modals for footer links
import Logo from '../../assets/images/nav-logo.svg'; 
import { Modal } from '../../components/landing/AnimatedUI';
import { PrivacyContent, TermsContent, SupportContent } from '../../components/landing/LandingModals';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Modal State
  const [modal, setModal] = useState(null);

  // Error States
  const [sessionError, setSessionError] = useState(''); 
  const [formErrors, setFormErrors] = useState({});     
  
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });

  const modalConfig = {
    privacy: { title: "Privacy Policy", content: <PrivacyContent setModal={setModal} /> },
    terms:   { title: "Terms of Service", content: <TermsContent onAccept={() => setModal(null)} /> },
    support: { title: "SentinelShield - Support", content: <SupportContent /> },
    "support-privacy": { title: "SentinelShield - Support", content: <SupportContent initialCategory="privacy" /> },
  };

  useEffect(() => {
    if (!token) setSessionError('Invalid or missing security token. Please request a new link.');
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (formData.password.length < 8) newErrors.password = 'Minimum 8 characters required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return; 
    }

    setIsLoading(true);
    try {
      await authService.completeReset({ token, newPassword: formData.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000); 
    } catch (err) {
      setSessionError(err.response?.data?.message || 'Link expired. Please request again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-['Inter',sans-serif] relative overflow-hidden">
      
      {/* Background Accent */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "linear-gradient(#0A4A87 1px, transparent 1px), linear-gradient(90deg, #0A4A87 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 flex flex-col items-center relative z-10">
        <Link to="/" className="mb-6 outline-none hover:opacity-80 transition-opacity">
          <img src={Logo} alt="SentinelShield Logo" style={{ width: 160, height: 45, objectFit: "contain" }} />
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-sm relative z-10">
        <div className="bg-white py-8 px-6 shadow-[0_20px_40px_rgba(10,74,135,0.05)] border border-slate-100 rounded-2xl">
          
          {sessionError ? (
            <div className="text-center">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">Session Error</h3>
              <p className="text-sm text-slate-500 mb-6 mt-2">{sessionError}</p>
              <Button onClick={() => navigate('/forgot-password')} className="w-full">
                Request New Link
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0A4A87] to-[#07D1B2] rounded-xl flex items-center justify-center shadow-lg mb-4">
                  <Lock size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">Set new password</h2>
                <p className="mt-2 text-sm text-slate-500">Must be at least 8 characters long.</p>
              </div>

              {success ? (
                <div className="text-center py-4">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#E6F9F6] mb-4">
                    <Check className="h-6 w-6 text-[#07D1B2]" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">Password reset complete</h3>
                  <p className="mt-2 text-sm text-slate-500">Redirecting to login...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <InputField label="New Password" name="password" type="password" icon={Lock} placeholder="••••••••" isPassword={true} showPassword={showPass} togglePassword={() => setShowPass(!showPass)} value={formData.password} onChange={handleInputChange} error={formErrors.password} />
                  <InputField label="Confirm New Password" name="confirmPassword" type="password" icon={Lock} placeholder="••••••••" isPassword={true} showPassword={showConfirm} togglePassword={() => setShowConfirm(!showConfirm)} value={formData.confirmPassword} onChange={handleInputChange} error={formErrors.confirmPassword} />
                  <div className="pt-2">
                    <Button type="submit" isLoading={isLoading} className="w-full">Update Password</Button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
        
        {/* Footer links mirroring AuthLayout */}
        <div className="mt-8 flex justify-center space-x-6 text-xs text-slate-500 font-medium">
          <button onClick={() => setModal('privacy')} className="hover:text-[#07D1B2] transition-colors outline-none">Privacy Policy</button>
          <button onClick={() => setModal('terms')} className="hover:text-[#07D1B2] transition-colors outline-none">Terms of Service</button>
          <button onClick={() => setModal('support')} className="hover:text-[#07D1B2] transition-colors outline-none">Contact Support</button>
        </div>
      </div>

      {/* Render Modals */}
      <div className="relative z-[9999]">
        {Object.entries(modalConfig).map(([key, { title, content }]) => (
          <Modal key={key} open={modal === key} onClose={() => setModal(null)} title={title}>
            {content}
          </Modal>
        ))}
      </div>
    </div>
  );
};