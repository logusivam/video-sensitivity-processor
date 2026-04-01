import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({ children, isLoading, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "w-full py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={isLoading} {...props}>
      {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
      {children}
    </button>
  );
};