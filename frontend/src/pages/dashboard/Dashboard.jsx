import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Video, Loader2, FolderKanban, Play, Clock, MoreVertical, Upload, Trash2 } from 'lucide-react';
import { Sidebar } from '../../components/dashboard/Sidebar';
import { InviteModal } from '../../components/dashboard/InviteModal';
import { UploadArea } from '../../components/dashboard/UploadArea';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/auth.service';
import { videoService } from '../../services/video.service';
import { API_CONFIG } from '../../config/api.config';
import { VideoPlayerPopover } from '../../components/dashboard/VideoPlayerPopover';

export const Dashboard = () => {
  const navigate = useNavigate();
  
  // App State
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [processingJobs, setProcessingJobs] = useState({}); 
  
  // UI State
  const [activeTab, setActiveTab] = useState('my-uploads');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null); // For the 3-dot menu

  useEffect(() => {
    authService.getMe()
      .then(data => setUser(data.user))
      .catch(() => navigate('/login'));
  }, [navigate]);

  const fetchVideos = async () => {
    try {
      const data = activeTab === 'my-uploads' 
        ? await videoService.getMyUploads() 
        : await videoService.getOrgVideos();
      setVideos(data.videos || []);
    } catch (err) {
      console.error("Failed to fetch videos", err);
    }
  };

  useEffect(() => {
    if (user) fetchVideos();
  }, [user, activeTab]);

  useEffect(() => {
    if (!user) return;
    const socket = io(API_CONFIG.BASE_URL, { withCredentials: true });
    socket.emit('join_org_room', user.organizationId);

    socket.on('processing_progress', (data) => {
      setProcessingJobs(prev => ({ ...prev, [data.videoId]: data }));
    });

    socket.on('processing_completed', (data) => {
      setProcessingJobs(prev => {
        const newJobs = { ...prev };
        delete newJobs[data.videoId];
        return newJobs;
      });
      fetchVideos();
    });

    return () => socket.disconnect();
  }, [user]);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handlePlayVideo = async (videoId) => {
    try {
      const data = await videoService.getPlayUrl(videoId);
      setActiveVideo(data);
    } catch (err) {
      alert(err.response?.data?.message || "Playback failed");
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to permanently delete this video?")) return;
    try {
      await videoService.deleteVideo(videoId);
      fetchVideos();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const activeProcessingArray = Object.values(processingJobs);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex">
      <Sidebar 
        user={user}
        activeTab={activeTab} setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} 
        setShowInviteModal={setShowInviteModal} 
      />
      
      <InviteModal showInviteModal={showInviteModal} setShowInviteModal={setShowInviteModal} />
      <VideoPlayerPopover videoData={activeVideo} onClose={() => setActiveVideo(null)} />

      <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all duration-300">
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

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {activeTab === 'my-uploads' ? 'My Uploads' : 'Organization Library'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">Manage, view, and process your secure content.</p>
            </div>
            {activeTab === 'my-uploads' && (
              <Button variant="primary" icon={Upload} onClick={() => setShowUploadArea(!showUploadArea)}>
                Upload New Video
              </Button>
            )}
          </div>

          <UploadArea 
            showUploadArea={showUploadArea} 
            setShowUploadArea={setShowUploadArea} 
            onUploadComplete={fetchVideos} 
          />

          {activeTab === 'my-uploads' && activeProcessingArray.length > 0 && (
            <div className="mb-10">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <Loader2 size={16} className="animate-spin mr-2 text-green-600" />
                Currently Processing ({activeProcessingArray.length})
              </h3>
              <div className="space-y-3">
                {activeProcessingArray.map(job => (
                  <div key={job.videoId} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <Video size={20} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                        <span className="text-xs font-medium text-green-600">{job.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                        <div className="bg-green-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${job.progress}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-500">{job.statusMessage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <FolderKanban size={16} className="mr-2 text-slate-400" />
              Completed Videos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map(video => (
                <div key={video._id} className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  
                  {/* Thumbnail Area - Click to Play */}
                  <div 
                    className="relative aspect-video bg-slate-100 flex items-center justify-center border-b border-slate-100 overflow-hidden cursor-pointer"
                    onClick={() => handlePlayVideo(video._id)}
                  >
                    {/* Render Actual Thumbnail if exists */}
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 opacity-50"></div>
                    )}
                    
                    <button className="relative z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                      <Play size={20} className="ml-1" />
                    </button>
                    
                    <div className="absolute top-3 right-3 z-10">
                      <Badge status={video.safetyStatus} />
                    </div>
                    
                    {/* Actual Duration Format (e.g., 2:05) */}
                    <div className="absolute bottom-3 right-3 z-10 px-2 py-1 bg-slate-900/80 backdrop-blur-md rounded text-[10px] text-white font-medium flex items-center">
                      <Clock size={10} className="mr-1" />
                      {video.durationSeconds ? `${Math.floor(video.durationSeconds / 60)}:${(video.durationSeconds % 60).toString().padStart(2, '0')}` : '0:00'}
                    </div>
                  </div>

                  {/* Card Details & Dropdown Menu */}
                  <div className="p-4 flex-1 flex flex-col relative">
                    <div className="flex justify-between items-start mb-2">
                      <h4 
                        className="text-sm font-semibold text-slate-900 line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors pr-4"
                        onClick={() => handlePlayVideo(video._id)}
                      >
                        {video.title}
                      </h4>
                      
                      {/* Three-Dot Menu (Delete logic) */}
                      <div className="relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === video._id ? null : video._id); }}
                          className="text-slate-400 hover:text-slate-900 transition-colors p-1"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {openDropdownId === video._id && user?.role?.toLowerCase() === 'admin' && (
                          <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-md shadow-lg z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                            <button 
                              onClick={() => handleDeleteVideo(video._id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 size={14} className="mr-2" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-auto text-xs text-slate-500">
                      Uploaded {new Date(video.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {videos.length === 0 && (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-slate-50">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <Video size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No videos yet</h3>
                <p className="text-sm text-slate-500 max-w-sm mb-6">
                  {activeTab === 'my-uploads' 
                    ? "Get started by uploading your first video. It will be securely processed and analyzed." 
                    : "No videos have been shared with your organization yet."}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};