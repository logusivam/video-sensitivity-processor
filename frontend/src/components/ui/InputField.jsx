import React from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export const InputField = ({ label, error, type, icon: Icon, isPassword, showPassword, togglePassword, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Icon size={16} />
        </div>
      )}
      <input
        type={isPassword && showPassword ? 'text' : type}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} ${isPassword ? 'pr-10' : 'pr-3'} py-2 bg-white border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900'
        } rounded-md text-sm shadow-sm transition-all outline-none focus:ring-1 placeholder:text-slate-400`}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
    {error && (
      <p className="mt-1.5 text-xs text-red-500 flex items-center">
        <AlertCircle size={12} className="mr-1" />
        {error}
      </p>
    )}
  </div>
);