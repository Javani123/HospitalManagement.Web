import React from 'react';
import {
  Users,
  ClipboardList,
  TestTube2,
  Hourglass,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { DashboardStatMetric } from '../../../types/dashboard';

export interface StatCardProps {
  metric?: DashboardStatMetric;
  title?: string;
  value?: string | number;
  icon?: React.ReactNode;
  iconName?: 'Users' | 'ClipboardList' | 'TestTube2' | 'Hourglass' | 'CheckCircle2' | 'Activity';
  subtitle?: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  colorTheme?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  className?: string;
}

const themeStyles = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-100',
    iconBg: 'bg-blue-600 text-white',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-600 text-white',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-100',
    iconBg: 'bg-amber-500 text-white',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-100',
    iconBg: 'bg-purple-600 text-white',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-100',
    iconBg: 'bg-rose-600 text-white',
  },
};

const defaultIcons: Record<string, React.ReactNode> = {
  Users: <Users className="w-5 h-5" />,
  ClipboardList: <ClipboardList className="w-5 h-5" />,
  TestTube2: <TestTube2 className="w-5 h-5" />,
  Hourglass: <Hourglass className="w-5 h-5" />,
  CheckCircle2: <CheckCircle2 className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
};

export const StatCard: React.FC<StatCardProps> = ({
  metric,
  title: propTitle,
  value: propValue,
  icon: propIcon,
  iconName: propIconName,
  subtitle: propSubtitle,
  change: propChange,
  changeType: propChangeType,
  colorTheme: propColorTheme,
  className = '',
}) => {
  const title = metric?.title ?? propTitle ?? '';
  const value = metric?.value ?? propValue ?? '0';
  const subtitle = metric?.description ?? propSubtitle;
  const change = metric?.change ?? propChange;
  const changeType = metric?.changeType ?? propChangeType ?? 'neutral';
  const colorTheme = metric?.colorTheme ?? propColorTheme ?? 'blue';

  const theme = themeStyles[colorTheme] || themeStyles.blue;
  const icon =
    propIcon ||
    (metric?.iconName ? defaultIcons[metric.iconName] : null) ||
    (propIconName ? defaultIcons[propIconName] : null) ||
    <Users className="w-5 h-5" />;

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all hover:shadow-md hover:border-slate-300 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${theme.iconBg}`}>
          {icon}
        </div>
      </div>

      {(change || subtitle) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {change ? (
            <div
              className={`flex items-center gap-1 font-medium ${
                changeType === 'increase'
                  ? 'text-emerald-600'
                  : changeType === 'decrease'
                  ? 'text-rose-600'
                  : 'text-slate-500'
              }`}
            >
              {changeType === 'increase' && <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />}
              {changeType === 'decrease' && <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />}
              <span>{change}</span>
            </div>
          ) : (
            <span />
          )}
          {subtitle && <span className="text-slate-400 truncate max-w-[140px] text-right">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
