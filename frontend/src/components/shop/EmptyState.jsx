import React from 'react';

const EmptyState = ({ icon = '🛒', title = 'Nothing here yet', message = '', actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
    {message && <p className="text-sm text-gray-500 max-w-sm mb-4">{message}</p>}
    {actionLabel && onAction && (
      <button onClick={onAction} className="btn-primary">
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
