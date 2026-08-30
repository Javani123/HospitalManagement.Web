import React from 'react';
import { Table, type ColumnDef } from '../../../components/common/Table';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { ClipboardList, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RecentLabOrder } from '../../../types/dashboard';

interface RecentLabOrdersSectionProps {
  orders: RecentLabOrder[];
  isLoading?: boolean;
}

export const RecentLabOrdersSection: React.FC<RecentLabOrdersSectionProps> = ({
  orders,
  isLoading = false,
}) => {
  const columns: ColumnDef<RecentLabOrder>[] = [
    {
      key: 'orderNumber',
      header: 'Order #',
      width: '18%',
      render: (order) => (
        <div className="font-mono text-xs font-semibold text-blue-700 bg-blue-50/70 px-2 py-1 rounded-md inline-block">
          {order.orderNumber}
        </div>
      ),
    },
    {
      key: 'patientName',
      header: 'Patient',
      width: '24%',
      render: (order) => (
        <div>
          <p className="font-semibold text-slate-800 text-sm">{order.patientName}</p>
          <p className="font-mono text-[11px] text-slate-400">{order.patientId}</p>
        </div>
      ),
    },
    {
      key: 'tests',
      header: 'Ordered Tests',
      width: '32%',
      render: (order) => (
        <div className="flex flex-wrap gap-1">
          {order.tests.map((testName, i) => (
            <span
              key={`${order.id}-test-${i}`}
              className="inline-block text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60 truncate max-w-[220px]"
              title={testName}
            >
              {testName}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '14%',
      render: (order) => <StatusBadge status={order.status} size="sm" />,
    },
    {
      key: 'date',
      header: 'Date & Time',
      width: '12%',
      align: 'right',
      render: (order) => (
        <div className="text-right">
          <p className="text-xs font-medium text-slate-700">{order.date}</p>
          <p className="text-[11px] text-slate-400">{order.time}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">Recent Lab Orders</h3>
            <p className="text-xs text-slate-400">Diagnostic requisitions placed today</p>
          </div>
        </div>

        <Link
          to="/pathology/lab-orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
        >
          <span>View All Orders</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Orders Table */}
      <Table<RecentLabOrder>
        columns={columns}
        data={orders}
        keyExtractor={(order) => order.id}
        isLoading={isLoading}
        emptyTitle="No recent lab orders"
        emptyDescription="There are currently no lab orders created today."
        emptyIcon={<ClipboardList className="w-6 h-6 text-slate-400" />}
        className="border-0 rounded-none shadow-none"
      />
    </div>
  );
};
