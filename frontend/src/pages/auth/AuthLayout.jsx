import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function AuthLayout() {
  const location = useLocation();
  
  // Grab success messages passed from other routes (e.g., from Register -> Login)
  const globalMessage = location.state?.message;

  // Determine headers dynamically based on the current URL
  const getViewConfig = () => {
    if (location.pathname.includes('register')) {
      return { title: 'Create your account', subtitle: 'Set up your organization workspace' };
    }
    if (location.pathname.includes('forgot-password')) {
      return { title: 'Reset password', subtitle: 'Recover access to your account' };
    }
    return { title: 'Welcome back', subtitle: 'Sign in to your workspace' };
  };

  const config = getViewConfig();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 flex flex-col items-center">
        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm mb-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
          {config.title}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          {config.subtitle}
        </p>
      </div>

      <div className={`sm:mx-auto sm:w-full transition-all duration-300 ease-in-out ${location.pathname.includes('register') ? 'sm:max-w-xl' : 'sm:max-w-sm'}`}>
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200 rounded-xl">
          
          {globalMessage && (
            <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200 flex items-start">
              <Check size={16} className="text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-green-700 font-medium">{globalMessage}</p>
            </div>
          )}

          {/* This is where Login, Register, or ForgotPassword will render */}
          <Outlet />

        </div>
        
        <div className="mt-8 flex justify-center space-x-6 text-xs text-slate-500">
          <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Contact Support</a>
        </div>
      </div>
    </div>
  );
}