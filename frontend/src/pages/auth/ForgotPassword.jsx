import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call for now
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1000);
  };

  if (isSent) {
    return (
      <div className="text-center">
        <p className="text-sm text-slate-600 mb-6">If an account exists, a reset link has been sent to {email}.</p>
        <Button type="button" variant="secondary" onClick={() => navigate('/login')}>
          <ArrowLeft size={16} className="mr-2" /> Back to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        Enter the email address associated with your account and we'll send you a link to reset your password.
      </p>
      <InputField label="Email Address" name="email" type="email" icon={Mail} placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className="pt-2 space-y-3">
        <Button type="submit" isLoading={isLoading}>Send Reset Link</Button>
        <Button type="button" variant="secondary" onClick={() => navigate('/login')}>
          <ArrowLeft size={16} className="mr-2" /> Back to Login
        </Button>
      </div>
    </form>
  );
};