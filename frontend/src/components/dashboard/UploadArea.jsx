import React from 'react';
import { XCircle, Upload } from 'lucide-react';
import { Button } from '../ui/Button';

export const UploadArea = ({ showUploadArea, setShowUploadArea }) => {
  if (!showUploadArea) return null;
  return (
    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-xl shadow-sm animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Upload New Video</h3>
        <button onClick={() => setShowUploadArea(false)} className="text-slate-400 hover:text-slate-600">
          <XCircle size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Drag & Drop Zone */}
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-4">
            <Upload size={20} className="text-slate-600" />
          </div>
          <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
          <p className="text-xs text-slate-500 mt-1">MP4, MOV, or WebM (max. 2GB)</p>
        </div>

        {/* Metadata Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Video Title</label>
            <input type="text" placeholder="Enter a descriptive title..." className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-1 focus:ring-slate-900 outline-none" />
          </div>
          
          <div className="flex items-center justify-between p-3 border border-slate-200 rounded-md bg-slate-50">
            <div>
              <p className="text-sm font-medium text-slate-900">Share with Organization</p>
              <p className="text-xs text-slate-500">Make visible in Org Library</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <Button variant="primary" className="w-full" icon={Upload}>Start Upload & Processing</Button>
        </div>
      </div>
    </div>
  );
};