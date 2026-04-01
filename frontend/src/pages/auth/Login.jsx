import React, { useState } from 'react';
import { Mail, Lock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/auth.service';

export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrors({ email: !formData.email ? 'Required' : null, password: !formData.password ? 'Required' : null });
      return;
    }

    setIsLoading(true);
    try {
      await authService.login(formData);
      // Navigate to dashboard after successful login
      navigate('/dashboard'); 
    } catch (err) {
      setErrors({ email: err.response?.data?.message || 'Login failed. Check credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField label="Email Address" name="email" type="email" icon={Mail} placeholder="you@company.com" value={formData.email} onChange={handleInputChange} error={errors.email} />
      <div>
        <InputField label="Password" name="password" type="password" icon={Lock} placeholder="••••••••" isPassword={true} showPassword={showPassword} togglePassword={() => setShowPassword(!showPassword)} value={formData.password} onChange={handleInputChange} error={errors.password} />
        <div className="flex items-center justify-between mt-2 mb-6">
          <label className="flex items-center text-sm text-slate-600 cursor-pointer group">
            <div className="relative flex items-center justify-center w-4 h-4 mr-2 border rounded border-slate-300 group-hover:border-slate-400 transition-colors">
              <input type="checkbox" name="rememberMe" className="absolute opacity-0 w-full h-full cursor-pointer" checked={formData.rememberMe} onChange={handleInputChange} />
              {formData.rememberMe && <Check size={12} className="text-slate-900" />}
            </div>
            Remember me
          </label>
          <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors">
            Forgot password?
          </button>
        </div>
      </div>
      <Button type="submit" isLoading={isLoading}>Sign In</Button>
      <div className="mt-6 text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <button type="button" onClick={() => navigate('/register')} className="font-medium text-slate-900 hover:underline transition-all">
          Request access
        </button>
      </div>
    </form>
  );
};