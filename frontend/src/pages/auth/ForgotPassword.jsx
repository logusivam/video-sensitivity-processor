import { useState } from 'react';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/auth.service';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(''); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.requestReset(email);
      setSuccess(true);
    } catch (err) {
      console.error("Reset Error:", err);
      setSuccess(true); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!success ? (
        <>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </p>
          <InputField
            label="Email Address"
            name="email"
            type="email"
            icon={Mail}
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="pt-2 space-y-3">
            <Button type="submit" isLoading={isLoading} className="w-full">
              Send Reset Link
            </Button>
            <Button variant="secondary" type="button" onClick={() => navigate('/login')} className="w-full border-slate-200 text-slate-700 hover:text-[#0A4A87]">
              <ArrowLeft size={16} className="mr-2" /> Back to Login
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#E6F9F6] mb-4">
            <Check className="h-6 w-6 text-[#07D1B2]" />
          </div>
          <p className="text-sm text-slate-600 mb-6 font-medium">
            If an account exists for <span className="text-[#0A4A87] font-bold">{email}</span>, a reset link has been sent. Please check your inbox.
          </p>
          <Button variant="secondary" type="button" onClick={() => navigate('/login')} className="w-full border-slate-200 text-slate-700 hover:text-[#0A4A87]">
            <ArrowLeft size={16} className="mr-2" /> Return to Login
          </Button>
        </div>
      )}
    </form>
  );
};