import React, { useState } from 'react';
import { Menu, X, Video, Loader2, FolderKanban, Play, Clock, MoreVertical, Upload } from 'lucide-react';
import { Sidebar } from '../../components/dashboard/Sidebar';
import { InviteModal } from '../../components/dashboard/InviteModal';
import { UploadArea } from '../../components/dashboard/UploadArea';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

// --- MOCK DATA ---
const MOCK_PROCESSING = [
  { id: 1, title: 'Q3_Earnings_Call_Raw.mp4', progress: 45, status: 'Analyzing sensitivity...' },
  { id: 2, title: 'Product_Demo_v2.mov', progress: 82, status: 'Optimizing for streaming...' }
];

const MOCK_VIDEOS = [
  { id: 1, title: 'All-Hands Meeting - October', date: 'Oct 24, 2025', duration: '45:20', status: 'safe' },
  { id: 2, title: 'Customer Interview - Acme Corp', date: 'Oct 22, 2025', duration: '12:05', status: 'flagged' },
  { id: 3, title: 'Engineering Standup', date: 'Oct 20, 2025', duration: '15:30', status: 'safe' },
  { id: 4, title: 'Marketing Campaign B-Roll', date: 'Oct 18, 2025', duration: '03:45', status: 'safe' },
];

export const Dashboard = () => {
  // Navigation & Layout State
  const [activeTab, setActiveTab] = useState('my-uploads');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Interactive Feature State
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex">
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
        setShowInviteModal={setShowInviteModal} 
      />
      
      <InviteModal 
        showInviteModal={showInviteModal} 
        setShowInviteModal={setShowInviteModal} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all duration-300">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center">
              <Video size={16} className="text-white" />
            </div>
            <span className="font-semibold text-sm">Video Platform</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Content Padding Wrapper */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {activeTab === 'my-uploads' ? 'My Uploads' : 'Organization Library'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage, view, and process your secure video content.
              </p>
            </div>
            {activeTab === 'my-uploads' && (
              <Button 
                variant="primary" 
                icon={Upload} 
                onClick={() => setShowUploadArea(!showUploadArea)}
              >
                Upload New Video
              </Button>
            )}
          </div>

          <UploadArea 
            showUploadArea={showUploadArea} 
            setShowUploadArea={setShowUploadArea} 
          />

          {/* Processing Queue Section */}
          {activeTab === 'my-uploads' && MOCK_PROCESSING.length > 0 && (
            <div className="mb-10">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <Loader2 size={16} className="animate-spin mr-2 text-indigo-600" />
                Currently Processing ({MOCK_PROCESSING.length})
              </h3>
              <div className="space-y-3">
                {MOCK_PROCESSING.map(job => (
                  <div key={job.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <Video size={20} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                        <span className="text-xs font-medium text-indigo-600">{job.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                        <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${job.progress}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-500">{job.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Grid Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <FolderKanban size={16} className="mr-2 text-slate-400" />
              Completed Videos
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {MOCK_VIDEOS.map(video => (
                <div key={video.id} className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  
                  {/* Thumbnail Area */}
                  <div className="relative aspect-video bg-slate-100 flex items-center justify-center border-b border-slate-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 opacity-50 group-hover:scale-105 transition-transform duration-500"></div>
                    
                    <button className="relative z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-slate-900 opacity-0 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-200 ease-out">
                      <Play size={20} className="ml-1" />
                    </button>
                    
                    <div className="absolute top-3 right-3 z-10">
                      <Badge status={video.status} />
                    </div>
                    
                    <div className="absolute bottom-3 right-3 z-10 px-2 py-1 bg-slate-900/70 backdrop-blur-md rounded text-[10px] font-medium text-white flex items-center">
                      <Clock size={10} className="mr-1" /> {video.duration}
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors cursor-pointer">
                        {video.title}
                      </h4>
                      <button className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center text-xs text-slate-500">
                      <span>Uploaded {video.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {MOCK_VIDEOS.length === 0 && (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-slate-50">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Video size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No videos yet</h3>
                <p className="text-sm text-slate-500 max-w-sm mb-6">
                  Get started by uploading your first video. It will be securely processed and analyzed.
                </p>
                <Button variant="secondary" icon={Upload} onClick={() => setShowUploadArea(true)}>
                  Upload a Video
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};