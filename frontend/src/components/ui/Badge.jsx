import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export const Badge = ({ status }) => {
  if (status === 'safe') {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200 shadow-sm backdrop-blur-md">
        <CheckCircle2 size={12} className="mr-1" /> Safe
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200 shadow-sm backdrop-blur-md">
      <AlertTriangle size={12} className="mr-1" /> 🚨 Flagged
    </span>
  );
};
