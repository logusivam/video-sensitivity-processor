import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

export const InviteModal = ({ showInviteModal, setShowInviteModal }) => {
  if (!showInviteModal) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">Invite to Organization</h3>
          <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input type="email" placeholder="colleague@company.com" className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-1 focus:ring-slate-900 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <select className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-1 focus:ring-slate-900 outline-none bg-white">
              <option value="viewer">Viewer (Read-only)</option>
              <option value="editor">Editor (Upload & Manage)</option>
            </select>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => setShowInviteModal(false)}>Cancel</Button>
          <Button variant="primary">Send Invite</Button>
        </div>
      </div>
    </div>
  );
};