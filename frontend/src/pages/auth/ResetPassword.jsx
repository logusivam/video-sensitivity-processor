import { useState, useEffect } from 'react';
import { Lock, AlertCircle, Check } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Error States separated!
  const [sessionError, setSessionError] = useState(''); // Fatal errors (kills the page)
  const [formErrors, setFormErrors] = useState({});     // Form errors (highlights the inputs)
  
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });

  // Initial check for missing token
  useEffect(() => {
    if (!token) setSessionError('Invalid or missing security token. Please request a new link.');
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear the specific field error as the user types
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validate Form Inputs locally
    const newErrors = {};
    if (formData.password.length < 8) {
      newErrors.password = 'Minimum 8 characters required';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return; // Stop submission
    }

    // 2. Submit to backend
    setIsLoading(true);
    try {
      await authService.completeReset({ token, newPassword: formData.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000); // Redirect after 3 seconds
    } catch (err) {
      // If the backend rejects the token (e.g., 5 mins expired)
      setSessionError(err.response?.data?.message || 'Link expired. Please request again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER FATAL ERROR SCREEN ---
  if (sessionError) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="bg-white py-10 px-6 shadow-sm border border-slate-200 rounded-2xl text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-900">Session Error</h3>
            <p className="text-sm text-slate-500 mb-6 mt-2">{sessionError}</p>
            <Button onClick={() => navigate('/forgot-password')}>
              Request New Link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER NORMAL SCREEN ---
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg mb-6">
          <Lock size={24} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Set new password</h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Your new password must be at least 8 characters long.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl">
          {success ? (
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Password reset complete</h3>
              <p className="mt-2 text-sm text-slate-500 mb-6">
                Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="New Password"
                name="password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                isPassword={true}
                showPassword={showPass}
                togglePassword={() => setShowPass(!showPass)}
                value={formData.password}
                onChange={handleInputChange}
                error={formErrors.password}
              />

              <InputField
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                isPassword={true}
                showPassword={showConfirm}
                togglePassword={() => setShowConfirm(!showConfirm)}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={formErrors.confirmPassword}
              />

              <div className="pt-2">
                <Button type="submit" isLoading={isLoading}>
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-400">
          Securely encrypted by your organization's security policy.
        </p>
      </div>
    </div>
  );
};