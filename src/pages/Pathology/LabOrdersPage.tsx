import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Search, Stethoscope } from 'lucide-react';
import { pathologyLabOrderService } from '../../services/pathologyLabOrderService';
import type { PathologyLabOrderDto, PathologyLabOrderFilters, PathologyLabOrderStatus } from '../../types/pathologyLabOrder';
import { useApiError } from '../../hooks/useApiError';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Table, type ColumnDef } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const statuses: PathologyLabOrderStatus[] = ['Ordered', 'SampleCollected', 'Processing', 'ResultEntered', 'Verified', 'Reported', 'Cancelled'];

export const LabOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { error, clearError, handleError } = useApiError();
  const [orders, setOrders] = useState<PathologyLabOrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState('');
  const [status, setStatus] = useState<PathologyLabOrderStatus | ''>('');
  const [orderDate, setOrderDate] = useState('');
  const load = useCallback(async (filters: PathologyLabOrderFilters = {}) => { clearError(); setIsLoading(true); try { setOrders(await pathologyLabOrderService.getAll(filters)); } catch (err) { handleError(err); } finally { setIsLoading(false); } }, [clearError, handleError]);
  useEffect(() => { void load(); }, [load]);
  const filter = () => { const filters: PathologyLabOrderFilters = {}; if (orderNumber.trim()) filters.orderNumber = orderNumber.trim(); if (status) filters.status = status; if (orderDate) filters.orderDate = orderDate; void load(filters); };
  const clear = () => { setOrderNumber(''); setStatus(''); setOrderDate(''); void load(); };
  const columns: ColumnDef<PathologyLabOrderDto>[] = [
    { key: 'orderNumber', header: 'Order Number', render: (o) => <span className="font-mono font-semibold text-blue-700">{o.orderNumber}</span> },
    { key: 'patientName', header: 'Patient', render: (o) => <div><p className="font-medium text-slate-900">{o.patientName}</p><p className="text-xs text-slate-500 font-mono">{o.patientNumber}</p></div> },
    {
      key: 'referringDoctor',
      header: 'Referring Doctor',
      render: (o) => (
        o.referringDoctorName ? (
          <div className="text-xs">
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <Stethoscope className="w-3 h-3 text-teal-600 shrink-0" />
              <span>{o.referringDoctorName}</span>
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              {o.referringDoctorRegistrationNumber || '—'}
            </p>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Self-Referred</span>
        )
      ),
    },
    { key: 'orderDate', header: 'Order Date', render: (o) => formatDateTime(o.orderDate) },
    { key: 'testCount', header: 'Tests', align: 'center' },
    { key: 'totalOrderValue', header: 'Order Value', align: 'right', render: (o) => formatCurrency(o.totalOrderValue) },
    {
      key: 'commission',
      header: 'Doctor Commission',
      align: 'right',
      render: (o) => (
        o.commission ? (
          <div className="text-right text-xs">
            <span className="font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded">
              {formatCurrency(o.commission.commissionAmount)}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">
              {o.commission.type.toLowerCase() === 'percentage'
                ? `${o.commission.rate}% of ${formatCurrency(o.commission.commissionableAmount)}`
                : 'Fixed Fee'}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">No Commission</span>
        )
      ),
    },
    { key: 'status', header: 'Status', align: 'center', render: (o) => <StatusBadge status={o.status} /> },
    { key: '_actions', header: 'Actions', align: 'right', render: (o) => <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/pathology/lab-orders/${o.id}`); }}>View</Button> },
  ];
  return <div className="space-y-6">
    <PageHeader title="Pathology Lab Orders" subtitle="Create and track tenant-scoped pathology test orders." breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Pathology', path: '/pathology' }, { label: 'Lab Orders' }]} actions={<Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/pathology/lab-orders/new')}>Create Lab Order</Button>} />
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <label className="relative lg:col-span-2"><span className="sr-only">Order number</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && filter()} placeholder="Search order number..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" /></label>
      <select value={status} onChange={(e) => setStatus(e.target.value as PathologyLabOrderStatus | '')} aria-label="Filter by status" className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50"><option value="">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value.replace(/([a-z])([A-Z])/g, '$1 $2')}</option>)}</select>
      <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} aria-label="Filter by order date" className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50" />
      <div className="flex gap-2"><Button variant="outline" onClick={filter} disabled={isLoading}>Filter</Button>{(orderNumber || status || orderDate) && <Button variant="ghost" onClick={clear}>Clear</Button>}</div>
    </div></div>
    {error && <ErrorAlert error={error} onDismiss={clearError} />}
    <Table columns={columns} data={orders} keyExtractor={(o) => o.id} isLoading={isLoading} loadingMessage="Loading lab orders..." emptyTitle="No lab orders found" emptyDescription="Create a pathology lab order to begin the diagnostic workflow." emptyIcon={<ClipboardList className="w-6 h-6" />} emptyActionLabel="Create Lab Order" onEmptyAction={() => navigate('/pathology/lab-orders/new')} onRowClick={(o) => navigate(`/pathology/lab-orders/${o.id}`)} striped />
  </div>;
};
