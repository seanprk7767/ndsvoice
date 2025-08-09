import React, { useState } from 'react';
import { Check, X, MessageSquare } from 'lucide-react';
import { Submission } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface AdminActionsProps {
  submission: Submission;
  onClose: () => void;
}

const AdminActions: React.FC<AdminActionsProps> = ({ submission, onClose }) => {
  const { updateSubmission } = useApp();
  const { user } = useAuth();
  const [status, setStatus] = useState(submission.status);
  const [priority, setPriority] = useState(submission.priority);
  const [adminNotes, setAdminNotes] = useState(submission.adminNotes || '');

  const handleSave = () => {
    const updates: Partial<Submission> = {
      status,
      priority,
      adminNotes: adminNotes.trim() || undefined,
    };

    if (status === 'resolved' && submission.status !== 'resolved') {
      updates.resolvedAt = new Date();
      updates.resolvedBy = user?.id;
    }

    updateSubmission(submission.id, updates);
    onClose();
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Admin Actions</h4>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Submission['status'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="in-review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Submission['priority'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">Admin Notes</label>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Add notes for the submitter..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200 flex items-center gap-1"
        >
          <Check className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AdminActions;