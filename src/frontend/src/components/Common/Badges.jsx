import React from 'react';

export const SeverityBadge = ({ severity }) => {
  const styles = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-orange-100 text-orange-800',
    Critical: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[severity] || 'bg-gray-100 text-gray-800'}`}>
      {severity}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    Active: 'bg-red-100 text-red-800',
    Resolved: 'bg-gray-100 text-gray-800',
    'In Transit': 'bg-blue-100 text-blue-800',
    Delayed: 'bg-orange-100 text-orange-800',
    Delivered: 'bg-green-100 text-green-800',
    Available: 'bg-green-100 text-green-800',
    Assigned: 'bg-blue-100 text-blue-800',
    Maintenance: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};
