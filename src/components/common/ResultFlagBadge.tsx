import React from 'react';
import { ArrowDown, ArrowUp, CheckCircle, HelpCircle } from 'lucide-react';
import type { PathologyResultFlag } from '../../types/pathologyResult';

interface ResultFlagBadgeProps {
  flag: PathologyResultFlag | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const ResultFlagBadge: React.FC<ResultFlagBadgeProps> = ({
  flag,
  size = 'sm',
  className = '',
}) => {
  const normalized = (flag || 'NotEvaluated').trim();

  switch (normalized) {
    case 'Low':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 ${
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          } ${className}`}
          title="Result is below reference range"
        >
          <ArrowDown className="w-3 h-3 text-amber-600 shrink-0" />
          <span>LOW</span>
        </span>
      );

    case 'High':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 ${
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          } ${className}`}
          title="Result is above reference range"
        >
          <ArrowUp className="w-3 h-3 text-rose-600 shrink-0" />
          <span>HIGH</span>
        </span>
      );

    case 'Normal':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          } ${className}`}
          title="Result is within reference range"
        >
          <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>NORMAL</span>
        </span>
      );

    case 'NotEvaluated':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200 ${
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          } ${className}`}
          title="Not evaluated against numeric reference range"
        >
          <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
          <span>NOT EVALUATED</span>
        </span>
      );
  }
};
