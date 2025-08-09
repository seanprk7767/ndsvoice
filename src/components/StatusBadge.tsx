import React from 'react';
import { Clock, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Submission } from '../types';

interface StatusBadgeProps {
  status: Submission['status'];
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = {
    pending: {
      icon: Clock,
      text: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    'in-review': {
      icon: Eye,
      text: 'In Review',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    resolved: {
      icon: CheckCircle,
      text: 'Resolved',
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    rejected: {
      icon: XCircle,
      text: 'Rejected',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
  };

  const { icon: Icon, text, className } = config[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses} font-medium rounded-full border ${className}`}>
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />
      {text}
    </span>
  );
};

export default StatusBadge;