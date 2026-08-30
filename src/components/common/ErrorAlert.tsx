import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import type { AppError } from '../../types/api';

interface ErrorAlertProps {
  error: AppError | string | null;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss, className = '' }) => {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message;
  const validationErrors = typeof error === 'object' && error !== null ? error.validationErrors : undefined;

  return (
    <div className={`p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <p className="font-semibold text-rose-900">{message}</p>
          {validationErrors && Object.keys(validationErrors).length > 0 && (
            <ul className="mt-2 list-disc list-inside space-y-1 text-rose-700 text-xs">
              {Object.entries(validationErrors).map(([field, errs]) =>
                errs.map((err, idx) => (
                  <li key={`${field}-${idx}`}>
                    <span className="font-medium">{field}:</span> {err}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
