import React from 'react';
import { ArrowDown, ArrowUp, Check, Minus } from 'lucide-react';
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
          className={`inline-flex items-center gap-1 font-bold rounded px-2 py-0.5 tracking-wide bg-amber-50 text-amber-800 border border-amber-300/80 ${
            size === 'sm' ? 'text-[10px]' : 'text-xs'
          } ${className}`}
          title="Result is below biological reference range"
        >
          <ArrowDown className="w-2.5 h-2.5 text-amber-700 stroke-[2.5] shrink-0" />
          <span>LOW</span>
        </span>
      );

    case 'High':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded px-2 py-0.5 tracking-wide bg-rose-50 text-rose-800 border border-rose-300/80 ${
            size === 'sm' ? 'text-[10px]' : 'text-xs'
          } ${className}`}
          title="Result is above biological reference range"
        >
          <ArrowUp className="w-2.5 h-2.5 text-rose-700 stroke-[2.5] shrink-0" />
          <span>HIGH</span>
        </span>
      );

    case 'Normal':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded px-2 py-0.5 tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-300/80 ${
            size === 'sm' ? 'text-[10px]' : 'text-xs'
          } ${className}`}
          title="Result is within biological reference range"
        >
          <Check className="w-2.5 h-2.5 text-emerald-700 stroke-[2.5] shrink-0" />
          <span>NORMAL</span>
        </span>
      );

    case 'NotEvaluated':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded px-2 py-0.5 tracking-wide bg-slate-100 text-slate-600 border border-slate-200 ${
            size === 'sm' ? 'text-[10px]' : 'text-xs'
          } ${className}`}
          title="Reference range not applicable or not configured"
        >
          <Minus className="w-2.5 h-2.5 text-slate-400 shrink-0" />
          <span>NOT EVALUATED</span>
        </span>
      );
  }
};
