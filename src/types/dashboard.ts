export type LabOrderStatus =
  | 'Ordered'
  | 'Sample Collected'
  | 'In Process'
  | 'Processing'
  | 'Result Entered'
  | 'Verified'
  | 'Released'
  | 'Pending'
  | 'Cancelled';

export interface DashboardStatMetric {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  description?: string;
  iconName: 'Users' | 'ClipboardList' | 'TestTube2' | 'Hourglass' | 'CheckCircle2' | 'Activity';
  colorTheme: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export interface DashboardStats {
  totalPatients: number;
  todayLabOrders: number;
  pendingSamples: number;
  pendingResults: number;
  completedToday?: number;
}

export interface RecentLabOrder {
  id: string;
  orderNumber: string;
  patientName: string;
  patientId: string;
  tests: string[];
  status: LabOrderStatus;
  date: string;
  time: string;
}

export interface PendingResultItem {
  id: string;
  patientName: string;
  patientId: string;
  testName: string;
  status: LabOrderStatus;
  timeElapsed: string;
  priority: 'Routine' | 'Urgent' | 'Stat';
}

export interface DashboardData {
  metrics: DashboardStatMetric[];
  recentOrders: RecentLabOrder[];
  pendingResults: PendingResultItem[];
}
