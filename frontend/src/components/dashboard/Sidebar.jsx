//import React from 'react';
import { Video, FolderKanban, UserPlus, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

export const Sidebar = ({ user, activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen, setShowInviteModal }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout(); // Clears HTTP-only cookie on backend
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#FAFAFA] border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      {/* Profile Section */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold shadow-sm uppercase">
            {user?.name ? user.name.substring(0, 2) : '..'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'Loading...'}</h2>
            <p className="text-xs text-slate-500 truncate">{user?.organization || 'Connecting...'}</p>
          </div>
        </div>
        <div className="mt-3">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 capitalize">
            {user?.role || 'viewer'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <button
          onClick={() => { setActiveTab('my-uploads'); setIsMobileMenuOpen(false); }}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'my-uploads' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Video size={18} className="mr-3 text-slate-400" />
          My Uploads
        </button>
        <button
          onClick={() => { setActiveTab('org-library'); setIsMobileMenuOpen(false); }}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'org-library' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <FolderKanban size={18} className="mr-3 text-slate-400" />
          Organization Library
        </button>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-200 space-y-2">
        <Button 
          variant="secondary" 
          className="w-full justify-start border-dashed" 
          icon={UserPlus}
          onClick={() => setShowInviteModal(true)}
        >
          Invite User
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-600 hover:text-red-600" 
          icon={LogOut}
          onClick={handleLogout}
        >
          Log out
        </Button>
      </div>
    </aside>
  );
};