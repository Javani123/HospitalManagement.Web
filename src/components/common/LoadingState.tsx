import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingStateProps {
  message?: string;
  description?: string;
  className?: string;
  minHeight?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  description,
  className = '',
  minHeight = 'min-h-[240px]',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-slate-200/80 ${minHeight} ${className}`}
      role="status"
      aria-live="polite"
    >
      <LoadingSpinner size="lg" className="text-blue-600 mb-3" />
      <h4 className="text-sm font-semibold text-slate-800">{message}</h4>
      {description && <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>}
    </div>
  );
};
