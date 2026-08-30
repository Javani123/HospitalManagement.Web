import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ClipboardList, User } from 'lucide-react';
import { pathologyLabOrderService } from '../../services/pathologyLabOrderService';
import type { PathologyLabOrderDto } from '../../types/pathologyLabOrder';
import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../hooks/useToast';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LoadingState } from '../../components/common/LoadingState';
import { ToastContainer } from '../../components/common/Toast';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => <div><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 text-sm font-medium text-slate-900">{value || '—'}</dd></div>;

export const PathologyLabOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); const navigate = useNavigate(); const location = useLocation();
  const { error, clearError, handleError } = useApiError(); const { toasts, dismiss, success } = useToast();
  const [order, setOrder] = useState<PathologyLabOrderDto | null>(null); const [isLoading, setIsLoading] = useState(true);
  const load = useCallback(async () => { if (!id || !Number.isInteger(Number(id))) return; clearError(); setIsLoading(true); try { setOrder(await pathologyLabOrderService.getById(Number(id))); } catch (err) { handleError(err); } finally { setIsLoading(false); } }, [id, clearError, handleError]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { const state = location.state as { toast?: string } | null; if (state?.toast) { success(state.toast); window.history.replaceState({}, ''); } }, [location.state, success]);
  if (isLoading) return <div className="space-y-6"><PageHeader title="Lab Order Details" breadcrumbs={[{ label: 'Lab Orders', path: '/pathology/lab-orders' }, { label: 'Loading...' }]} /><LoadingState message="Loading lab order..." /></div>;
  if (!order) return <div className="space-y-6"><PageHeader title="Lab Order Details" breadcrumbs={[{ label: 'Lab Orders', path: '/pathology/lab-orders' }, { label: 'Not Found' }]} />{error && <ErrorAlert error={error} onDismiss={clearError} />}<Button variant="outline" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => navigate('/pathology/lab-orders')}>Back to Orders</Button></div>;
  return <div className="space-y-6">
    <PageHeader title={`Lab Order ${order.orderNumber}`} subtitle="Historical order snapshots from the pathology laboratory workflow." breadcrumbs={[{ label: 'Pathology', path: '/pathology' }, { label: 'Lab Orders', path: '/pathology/lab-orders' }, { label: order.orderNumber }]} badge={<StatusBadge status={order.status} size="md" />} actions={<Button variant="outline" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => navigate('/pathology/lab-orders')}>Back to Orders</Button>} />
    {error && <ErrorAlert error={error} onDismiss={clearError} />}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><Card title="Order Information" subtitle="Backend-generated order metadata" className="lg:col-span-2"><dl className="grid grid-cols-1 sm:grid-cols-2 gap-5"><Field label="Order Number" value={<span className="font-mono text-blue-700">{order.orderNumber}</span>} /><Field label="Order Date" value={formatDateTime(order.orderDate)} /><Field label="Status" value={<StatusBadge status={order.status} />} /><Field label="Total Order Value" value={formatCurrency(order.totalOrderValue)} /><div className="sm:col-span-2"><Field label="Clinical Notes" value={order.clinicalNotes} /></div></dl></Card><Card title="Patient" subtitle="Patient selected at order creation"><div className="space-y-4"><div className="flex gap-3"><User className="w-5 h-5 text-blue-600" /><div><p className="font-semibold text-slate-900">{order.patientName}</p><p className="font-mono text-xs text-slate-500">{order.patientNumber}</p></div></div><Button variant="outline" size="sm" onClick={() => navigate(`/patients/${order.patientId}`)}>View Patient</Button></div></Card></div>
    <Card title="Ordered Tests" subtitle="Test name, code, and price are M9 historical snapshots and do not change with master data."><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-slate-600"><tr><th className="p-3 text-left">Test Code</th><th className="p-3 text-left">Test Name</th><th className="p-3 text-right">Price</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id} className="border-b"><td className="p-3 font-mono text-blue-700">{item.testCodeSnapshot}</td><td className="p-3 font-medium text-slate-900">{item.testNameSnapshot}</td><td className="p-3 text-right">{formatCurrency(item.price)}</td></tr>)}</tbody><tfoot><tr><td colSpan={2} className="p-3 text-right font-semibold">Total</td><td className="p-3 text-right font-bold">{formatCurrency(order.totalOrderValue)}</td></tr></tfoot></table></div></Card>
    <Card title="Next workflow steps"><div className="flex items-start gap-3 text-sm text-slate-600"><ClipboardList className="w-5 h-5 text-slate-400 shrink-0" /><p>Sample collection, result entry, verification, and reporting are separate workflow milestones. This page does not initiate those actions.</p></div></Card><ToastContainer toasts={toasts} onDismiss={dismiss} />
  </div>;
};
