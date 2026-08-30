import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  className = '',
}) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs text-slate-500 ${className}`}>
      {showHome && (
        <>
          <Link
            to="/dashboard"
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            title="Dashboard"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span className="sr-only">Dashboard</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        </>
      )}

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <React.Fragment key={`${item.label}-${idx}`}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="hover:text-blue-600 transition-colors font-medium text-slate-600"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none' : 'text-slate-500'}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
