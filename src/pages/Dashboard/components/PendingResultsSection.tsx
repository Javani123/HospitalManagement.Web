import React from 'react';
import { Table, type ColumnDef } from '../../../components/common/Table';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Hourglass, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PendingResultItem } from '../../../types/dashboard';

interface PendingResultsSectionProps {
  pendingResults: PendingResultItem[];
  isLoading?: boolean;
}

export const PendingResultsSection: React.FC<PendingResultsSectionProps> = ({
  pendingResults,
  isLoading = false,
}) => {
  const columns: ColumnDef<PendingResultItem>[] = [
    {
      key: 'patientName',
      header: 'Patient',
      width: '28%',
      render: (item) => (
        <div>
          <p className="font-semibold text-slate-800 text-sm">{item.patientName}</p>
          <p className="font-mono text-[11px] text-slate-400">{item.patientId}</p>
        </div>
      ),
    },
    {
      key: 'testName',
      header: 'Diagnostic Test',
      width: '34%',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-800 truncate" title={item.testName}>
            {item.testName}
          </span>
          {item.priority === 'Stat' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wider">
              <AlertCircle className="w-2.5 h-2.5" />
              STAT
            </span>
          )}
          {item.priority === 'Urgent' && (
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
              URGENT
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '20%',
      render: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: 'timeElapsed',
      header: 'Time Elapsed',
      width: '18%',
      align: 'right',
      render: (item) => (
        <span className="text-xs font-medium text-slate-500">{item.timeElapsed}</span>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Hourglass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">Pending Results Queue</h3>
            <p className="text-xs text-slate-400">Tests undergoing laboratory analysis</p>
          </div>
        </div>

        <Link
          to="/pathology/results"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors group"
        >
          <span>Open Results Queue</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Results Table */}
      <Table<PendingResultItem>
        columns={columns}
        data={pendingResults}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyTitle="No pending results"
        emptyDescription="All laboratory test results have been entered and verified."
        emptyIcon={<Hourglass className="w-6 h-6 text-slate-400" />}
        className="border-0 rounded-none shadow-none"
      />
    </div>
  );
};
