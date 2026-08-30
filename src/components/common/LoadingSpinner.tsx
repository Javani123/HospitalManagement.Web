import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading...',
  size = 'md',
  fullPage = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  }[size];

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 text-slate-500 ${className}`}>
      <Loader2 className={`${sizeClasses} animate-spin text-blue-600`} />
      {label && <p className="text-sm font-medium text-slate-600">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <p className="text-sm font-medium text-slate-700">{label}</p>
        </div>
      </div>
    );
  }

  return content;
};

export const LoadingSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-10 bg-slate-200/80 rounded-lg w-full"
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
};
