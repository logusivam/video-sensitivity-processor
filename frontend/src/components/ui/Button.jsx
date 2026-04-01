import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({ children, isLoading, variant = 'primary', className = '', icon: Icon, ...props }) => {
  const baseStyles = "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-sm";
  const variants = {
    primary: "bg-slate-900 hover:bg-slate-800 text-white",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200",
    danger: "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 shadow-none"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={isLoading} {...props}>
      {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
      {!isLoading && Icon && <Icon size={16} className={children ? "mr-2" : ""} />}
      {children}
    </button>
  );
};