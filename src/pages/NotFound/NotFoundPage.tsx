import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6 shadow-xs">
        <FileQuestion className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
        Error 404
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-md mb-8">
        The page or resource you are looking for does not exist, has been removed, or is not available in the current tenant module scope.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
};
