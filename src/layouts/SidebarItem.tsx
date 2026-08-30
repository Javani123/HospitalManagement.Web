import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
  end?: boolean;
  onClick?: () => void;
  isSubItem?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  to,
  icon,
  label,
  badge,
  end = false,
  onClick,
  isSubItem = false,
}) => {
  if (isSubItem) {
    return (
      <NavLink
        to={to}
        end={end}
        onClick={onClick}
        className={({ isActive }) =>
          `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors group ${
            isActive
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`
        }
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="shrink-0 text-slate-400 group-hover:text-slate-600 group-[.font-semibold]:text-blue-600">
            {icon}
          </span>
          <span className="truncate">{label}</span>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </NavLink>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-colors group ${
          isActive
            ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
        }`
      }
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0 text-slate-400 group-hover:text-slate-600 group-[.font-semibold]:text-blue-600">
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
      {badge && <div className="shrink-0">{badge}</div>}
    </NavLink>
  );
};
