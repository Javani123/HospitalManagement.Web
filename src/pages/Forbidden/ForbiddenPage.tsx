import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        {/* Shield Alert Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
          403 Access Restricted
        </span>

        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Permission Required
        </h1>

        <p className="text-sm text-slate-600 mb-6">
          You are currently signed in as <span className="font-semibold text-slate-900">{user?.fullName || user?.username}</span> with role{user?.roles && user.roles.length > 1 ? 's' : ''}: <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{user?.roles.join(', ') || 'No Role'}</span>. Your account does not have sufficient permissions to access this screen.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center justify-center gap-1.5 mx-auto transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign in with a different account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
