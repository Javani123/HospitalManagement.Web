import type { DashboardStatMetric, RecentLabOrder, PendingResultItem } from '../types/dashboard';

/**
 * Isolated Mock Data for Frontend Dashboard (F2 Milestone)
 * 
 * IMPORTANT:
 * - This mock data is purely for UI demonstration in F2.
 * - In subsequent milestones (F3+), this will be replaced with real backend API calls.
 */

export const mockDashboardMetrics: DashboardStatMetric[] = [
  {
    id: 'total-patients',
    title: 'Total Patients',
    value: '1,248',
    change: '+12% this month',
    changeType: 'increase',
    description: 'Active hospital records',
    iconName: 'Users',
    colorTheme: 'blue',
  },
  {
    id: 'today-orders',
    title: "Today's Lab Orders",
    value: '42',
    change: '+5 in last hour',
    changeType: 'increase',
    description: 'Diagnostic requisitions',
    iconName: 'ClipboardList',
    colorTheme: 'emerald',
  },
  {
    id: 'pending-samples',
    title: 'Pending Samples',
    value: '8',
    change: 'Awaiting phlebotomy',
    changeType: 'neutral',
    description: 'Sample collection queue',
    iconName: 'TestTube2',
    colorTheme: 'amber',
  },
  {
    id: 'pending-results',
    title: 'Pending Results',
    value: '5',
    change: '3 urgent priority',
    changeType: 'decrease',
    description: 'Awaiting laboratory entry',
    iconName: 'Hourglass',
    colorTheme: 'rose',
  },
];

export const mockRecentLabOrders: RecentLabOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-2026-0842',
    patientName: 'Jane Smith',
    patientId: 'PT-10492',
    tests: ['Complete Blood Count (CBC)', 'Lipid Profile'],
    status: 'Sample Collected',
    date: '2026-08-30',
    time: '10:45 AM',
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-2026-0841',
    patientName: 'Robert Johnson',
    patientId: 'PT-10491',
    tests: ['Liver Function Test (LFT)', 'Serum Creatinine'],
    status: 'Processing',
    date: '2026-08-30',
    time: '10:15 AM',
  },
  {
    id: 'ord-103',
    orderNumber: 'ORD-2026-0840',
    patientName: 'Maria Garcia',
    patientId: 'PT-10488',
    tests: ['Thyroid Stimulating Hormone (TSH)'],
    status: 'Result Entered',
    date: '2026-08-30',
    time: '09:30 AM',
  },
  {
    id: 'ord-104',
    orderNumber: 'ORD-2026-0839',
    patientName: 'David Lee',
    patientId: 'PT-10485',
    tests: ['Fasting Blood Sugar (FBS)', 'HbA1c'],
    status: 'Verified',
    date: '2026-08-30',
    time: '08:55 AM',
  },
  {
    id: 'ord-105',
    orderNumber: 'ORD-2026-0838',
    patientName: 'Emily Clark',
    patientId: 'PT-10482',
    tests: ['Urine Routine Examination'],
    status: 'Ordered',
    date: '2026-08-30',
    time: '08:20 AM',
  },
];

export const mockPendingResults: PendingResultItem[] = [
  {
    id: 'res-201',
    patientName: 'Robert Johnson',
    patientId: 'PT-10491',
    testName: 'Liver Function Test (LFT)',
    status: 'Processing',
    timeElapsed: '45 mins ago',
    priority: 'Urgent',
  },
  {
    id: 'res-202',
    patientName: 'Michael Brown',
    patientId: 'PT-10477',
    testName: 'Cardiac Troponin I',
    status: 'Processing',
    timeElapsed: '15 mins ago',
    priority: 'Stat',
  },
  {
    id: 'res-203',
    patientName: 'Maria Garcia',
    patientId: 'PT-10488',
    testName: 'Thyroid Stimulating Hormone (TSH)',
    status: 'Result Entered',
    timeElapsed: '1h 10m ago',
    priority: 'Routine',
  },
  {
    id: 'res-204',
    patientName: 'Samuel Wilson',
    patientId: 'PT-10469',
    testName: 'Serum Electrolytes (Na/K/Cl)',
    status: 'Sample Collected',
    timeElapsed: '2h 05m ago',
    priority: 'Routine',
  },
];
