//import React from 'react';
import { X } from 'lucide-react';

export const VideoPlayerPopover = ({ videoData, onClose }) => {
  if (!videoData) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        
        {/* Header */}
        <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
          <h3 className="text-white font-medium truncate pr-8">{videoData.title}</h3>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Element */}
        <div className="aspect-video flex items-center justify-center">
          <video 
            controls 
            autoPlay 
            className="w-full h-full"
            // 📌 prefetch="metadata" + FastStart allows instant scrubbing
            preload="metadata"
            controlsList="nodownload"
          >
            <source src={videoData.playUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Security Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Secure Stream</span>
          </div>
        </div>
      </div>
    </div>
  );
};