import React, { useState, useEffect } from 'react';
import { Calendar, User, Edit, Trash2, MessageSquare, Users, Building, TrendingUp } from 'lucide-react';
import { Submission } from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import AdminActions from './AdminActions';
import { UserService } from '../services/userService';

interface SubmissionCardProps {
  submission: Submission;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission }) => {
  const { user } = useAuth();
  const { deleteSubmission } = useApp();
  const [showAdminActions, setShowAdminActions] = useState(false);
  const [submitterName, setSubmitterName] = useState<string>('Loading...');

  const isOwner = user?.id === submission.submittedBy;
  const isAdmin = user?.role === 'admin';

  const typeColors = {
    complaint: 'text-red-600 bg-red-50 border-red-100',
    suggestion: 'text-blue-600 bg-blue-50 border-blue-100',
    idea: 'text-purple-600 bg-purple-50 border-purple-100',
  };

  const impactColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  const getManagerName = (managerId: string) => {
    const managers = {
      'operation-manager': 'Operation Manager',
      'hr-manager': 'HR Manager',
      'area-manager': 'Area Manager'
    };
    return managers[managerId as keyof typeof managers] || managerId;
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      deleteSubmission(submission.id);
    }
  };

  // Get submitter name and relevant staff names
  useEffect(() => {
    const getNames = async () => {
      try {
        // Get submitter name
        if (isAdmin) {
          const userData = await UserService.getUserById(submission.submittedBy);
          setSubmitterName(userData ? userData.name : 'Unknown User');
        } else {
          setSubmitterName('You');
        }
      } catch (error) {
        console.error('Error fetching names:', error);
        setSubmitterName('Unknown User');
      }
    };

    getNames();
  }, [submission.submittedBy, isAdmin]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border capitalize ${typeColors[submission.type]}`}>
              {submission.type}
            </span>
            <StatusBadge status={submission.status} size="sm" />
            <PriorityBadge priority={submission.priority} size="sm" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{submission.title}</h3>
        </div>
        
        {(isOwner || isAdmin) && (
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowAdminActions(!showAdminActions)}
                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {(isOwner && submission.status === 'pending') && (
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-gray-600 mb-4 leading-relaxed">{submission.description}</p>

      {/* Enhanced Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {submission.targetManager && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building className="w-4 h-4" />
            <span>Target Manager: {getManagerName(submission.targetManager)}</span>
          </div>
        )}
        
        {submission.category && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>Category: {submission.category}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <User className="w-4 h-4" />
          <span>By {submitterName}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>Submitted {submission.submittedAt.toLocaleDateString()}</span>
        </div>
        {submission.resolvedAt && (
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Resolved {submission.resolvedAt.toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {submission.adminNotes && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Admin Notes</span>
          </div>
          <p className="text-blue-800 text-sm">{submission.adminNotes}</p>
        </div>
      )}

      {showAdminActions && isAdmin && (
        <AdminActions
          submission={submission}
          onClose={() => setShowAdminActions(false)}
        />
      )}
    </div>
  );
};

export default SubmissionCard;