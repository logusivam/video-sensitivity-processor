import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/auth.service';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', organization: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [orgStatus, setOrgStatus] = useState(null);

  // Debounced Organization Check
  useEffect(() => {
    const checkOrg = async () => {
      if (formData.organization.length < 3) return;
      try {
        const res = await authService.validateOrg(formData.organization);
        setErrors(prev => ({ ...prev, organization: res.message })); 
        setOrgStatus('valid');
      } catch (err) {
        setErrors(prev => ({ ...prev, organization: err.response?.data?.message || 'Organization exists' }));
        setOrgStatus('invalid');
      }
    };
    const timeoutId = setTimeout(checkOrg, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.organization]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name] && name !== 'organization') setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email required';
    if (!formData.password || formData.password.length < 8) newErrors.password = 'Min 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (orgStatus === 'invalid') newErrors.organization = 'Invalid organization';
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0 && orgStatus === 'valid';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.register({
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        organization: formData.organization
      });
      // Pass a success state to the login page via router
      navigate('/login', { state: { message: 'Account created successfully. Please log in.' } });
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && <div className="text-red-500 text-sm mb-4">{errors.form}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Full Name" name="name" type="text" icon={User} placeholder="Jane Doe" value={formData.name} onChange={handleInputChange} error={errors.name} />
        <InputField label="Email Address" name="email" type="email" icon={Mail} placeholder="jane@company.com" value={formData.email} onChange={handleInputChange} error={errors.email} />
      </div>
      <InputField label="Organization / Tenant" name="organization" type="text" icon={Building} placeholder="Acme Corp" value={formData.organization} onChange={handleInputChange} error={errors.organization} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Password" name="password" type="password" icon={Lock} placeholder="••••••••" isPassword={true} showPassword={showPassword} togglePassword={() => setShowPassword(!showPassword)} value={formData.password} onChange={handleInputChange} error={errors.password} />
        <InputField label="Confirm Password" name="confirmPassword" type="password" icon={Lock} placeholder="••••••••" isPassword={true} showPassword={showConfirmPassword} togglePassword={() => setShowConfirmPassword(!showConfirmPassword)} value={formData.confirmPassword} onChange={handleInputChange} error={errors.confirmPassword} />
      </div>
      <div className="pt-2">
        <Button type="submit" isLoading={isLoading}>Create Account</Button>
      </div>
      <div className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <button type="button" onClick={() => navigate('/login')} className="font-medium text-slate-900 hover:underline transition-all">Sign in</button>
      </div>
    </form>
  );
};