import { useState, useEffect } from 'react';
import { Mail, Lock, User, Building, Check } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/auth.service';

export const Register = () => {
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [orgError, setOrgError] = useState('');
  const [isOrgValid, setIsOrgValid] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    organization: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.organization.trim().length >= 3) {
        try {
          const res = await authService.validateOrg(formData.organization);
          if (res.valid) {
            setOrgError(''); 
            setIsOrgValid(true);
            setErrors(prev => ({ ...prev, organization: null }));
          }
        } catch (err) {
          const msg = err.response?.data?.message || 'Organization already exists';
          setOrgError(msg);
          setIsOrgValid(false);
        }
      } else {
        setIsOrgValid(false);
        setOrgError('');
      }
    }, 600); 

    return () => clearTimeout(timer);
  }, [formData.organization]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.organization.trim()) newErrors.organization = 'Organization name is required';
    if (orgError) newErrors.organization = orgError;
    
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && isOrgValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const payload = {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        organization: formData.organization
      };

      await authService.register(payload);
      
      setSuccessMessage('Account created successfully. Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
      }, 2000);
    } catch (err) {
      const serverMsg = err.response?.data?.message || 'Registration failed. Try again.';
      setErrors({ global: serverMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {successMessage && (
        <div className="mb-6 p-4 rounded-md bg-[#E6F9F6] border border-[#07D1B2] flex items-start">
          <Check size={16} className="text-[#05B096] mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-[#05B096] font-medium">{successMessage}</p>
        </div>
      )}

      {errors.global && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
          {errors.global}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Full Name" name="name" type="text" icon={User} placeholder="Jane Doe" value={formData.name} onChange={handleInputChange} error={errors.name} />
          <InputField label="Email Address" name="email" type="email" icon={Mail} placeholder="jane@company.com" value={formData.email} onChange={handleInputChange} error={errors.email} />
        </div>

        <InputField label="Organization / Tenant" name="organization" type="text" icon={Building} placeholder="Acme Corp" value={formData.organization} onChange={handleInputChange} error={errors.organization || orgError} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Password" name="password" type="password" icon={Lock} placeholder="••••••••" isPassword={true} showPassword={showPassword} togglePassword={() => setShowPassword(!showPassword)} value={formData.password} onChange={handleInputChange} error={errors.password} />
          <InputField label="Confirm Password" name="confirmPassword" type="password" icon={Lock} placeholder="••••••••" isPassword={true} showPassword={showConfirmPassword} togglePassword={() => setShowConfirmPassword(!showConfirmPassword)} value={formData.confirmPassword} onChange={handleInputChange} error={errors.confirmPassword} />
        </div>

        <div className="pt-2">
          <Button type="submit" isLoading={isLoading && !successMessage} className="w-full">
            Create Account
          </Button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#0A4A87] hover:text-[#07D1B2] transition-all">
            Log in
          </Link>
        </div>
      </form>
    </>
  );
};