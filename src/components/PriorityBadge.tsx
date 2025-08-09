import React from 'react';
import { AlertTriangle, Minus, ArrowUp } from 'lucide-react';
import { Submission } from '../types';

interface PriorityBadgeProps {
  priority: Submission['priority'];
  size?: 'sm' | 'md';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const config = {
    low: {
      icon: Minus,
      text: 'Low',
      className: 'bg-gray-100 text-gray-700 border-gray-200',
    },
    medium: {
      icon: Minus,
      text: 'Medium',
      className: 'bg-orange-100 text-orange-700 border-orange-200',
    },
    high: {
      icon: AlertTriangle,
      text: 'High',
      className: 'bg-red-100 text-red-700 border-red-200',
    },
  };

  const { icon: Icon, text, className } = config[priority];
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses} font-medium rounded-full border ${className}`}>
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />
      {text}
    </span>
  );
};

export default PriorityBadge;