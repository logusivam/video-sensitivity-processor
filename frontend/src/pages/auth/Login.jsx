import { useState } from 'react';
import { Mail, Lock, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/auth.service';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.login(formData);
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
          {error}
        </div>
      )}

      <InputField
        label="Email Address"
        name="email"
        type="email"
        icon={Mail}
        placeholder="you@company.com"
        value={formData.email}
        onChange={handleInputChange}
        required
      />
      
      <div>
        <InputField
          label="Password"
          name="password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          isPassword={true}
          showPassword={showPassword}
          togglePassword={() => setShowPassword(!showPassword)}
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        
        <div className="flex items-center justify-between mt-2 mb-6">
          <label className="flex items-center text-sm text-slate-600 cursor-pointer group">
            <div className="relative flex items-center justify-center w-4 h-4 mr-2 border rounded border-slate-300 group-hover:border-[#0A4A87] transition-colors">
              <input
                type="checkbox"
                name="rememberMe"
                className="absolute opacity-0 w-full h-full cursor-pointer"
                checked={formData.rememberMe}
                onChange={handleInputChange}
              />
              {formData.rememberMe && <Check size={12} className="text-[#0A4A87]" />}
            </div>
            Remember me
          </label>
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm font-medium text-[#0A4A87] hover:text-[#07D1B2] transition-colors"
          >
            Forgot password?
          </button>
        </div>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Sign In
      </Button>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <button
          type="button"
          className="font-semibold text-[#0A4A87] hover:text-[#07D1B2] transition-all"
          onClick={() => navigate('/register')}
        >
          Create an account
        </button>
      </div>
    </form>
  );
};