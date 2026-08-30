import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading this section. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 rounded-xl border border-rose-200/80 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-rose-900 mb-1">{title}</h4>
      <p className="text-sm text-rose-700/90 max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
