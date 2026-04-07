import React, { useState, useRef } from 'react';
import { XCircle, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { videoService } from '../../services/video.service';
import toast from 'react-hot-toast';

export const UploadArea = ({ showUploadArea, setShowUploadArea, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [isShared, setIsShared] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  if (!showUploadArea) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Frontend Check: Prevent files larger than 50MB before they even upload
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 50MB.", { icon: '🚨' });
        return;
      }
      setFile(selectedFile);
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('isShared', isShared);

    try {
      await videoService.uploadVideo(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      
      toast.success("Upload started!");
      setTimeout(() => {
        setFile(null);
        setTitle('');
        setUploadProgress(0);
        setShowUploadArea(false);
        onUploadComplete(); 
      }, 500);

    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed", { icon: '🚨' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-8 p-6 bg-white border border-slate-200 rounded-xl shadow-sm animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Upload New Video</h3>
        <button onClick={() => setShowUploadArea(false)} className="text-slate-400 hover:text-slate-600">
          <XCircle size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="video/*" 
          onChange={handleFileChange} 
        />
        <div 
          onClick={() => !isUploading && fileInputRef.current.click()}
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors ${file ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer'}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm border mb-4 ${file ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-600 border-slate-200'}`}>
            {file ? <CheckCircle2 size={20} /> : <Upload size={20} />}
          </div>
          <p className="text-sm font-medium text-slate-900">{file ? file.name : 'Select video file'}</p>
          {/* 📌 UPDATED TO 50MB */}
          <p className="text-xs text-slate-500 mt-1">{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Max 50MB, Max 60 seconds'}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Video Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-slate-900" 
              disabled={isUploading}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 border border-slate-200 rounded-md bg-slate-50">
            <div>
              <p className="text-sm font-medium text-slate-900">Share with Organization</p>
              <p className="text-xs text-slate-500">Visible in Org Library</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isShared} onChange={(e) => setIsShared(e.target.checked)} disabled={isUploading} />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          {isUploading && (
            <div>
              <div className="flex justify-between text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-wider">
                <span>Transferring to Server</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-1.5 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}

          <Button 
            variant="primary" 
            className="w-full" 
            icon={Upload} 
            onClick={handleUpload} 
            isLoading={isUploading}
            disabled={!file}
          >
            Start Upload & Processing
          </Button>
        </div>
      </div>
    </div>
  );
};