import { patientService } from './patientService';
import { pathologyLabOrderService } from './pathologyLabOrderService';
import { pathologySampleService } from './pathologySampleService';
import { pathologyResultService } from './pathologyResultService';
import { formatDate } from '../utils/formatters';
import type {
  DashboardData,
  DashboardStatMetric,
  RecentLabOrder,
  PendingResultItem,
} from '../types/dashboard';

/**
 * Checks if an ISO date string falls on the current local day.
 */
function isToday(dateString?: string | null): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/**
 * Formats a relative or compact time elapsed string for results.
 */
function formatTimeElapsed(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

/**
 * Formats the time portion of an ISO datetime string.
 */
function formatTimeOnly(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '';
  }
}

export const dashboardService = {
  /**
   * Fetches real operational metrics, recent orders, and pending results from backend APIs.
   */
  async getDashboardData(): Promise<DashboardData> {
    const [patientsResult, ordersResult, samplesResult, resultsResult] = await Promise.allSettled([
      patientService.getAll(),
      pathologyLabOrderService.getAll(),
      pathologySampleService.getAll(),
      pathologyResultService.getAll(),
    ]);

    // 1. Total Patients
    const patients = patientsResult.status === 'fulfilled' ? patientsResult.value : [];
    const totalPatientsCount = patients.length;

    // 2. Today's Lab Orders & Recent Orders
    const orders = ordersResult.status === 'fulfilled' ? ordersResult.value : [];
    const todayOrdersCount = orders.filter((o) => isToday(o.orderDate)).length;

    // 3. Pending Samples (Collected but not yet Received in Lab)
    const samples = samplesResult.status === 'fulfilled' ? samplesResult.value : [];
    const pendingSamplesCount = samples.filter((s) => s.status === 'Collected').length;

    // 4. Pending Results (Results awaiting release)
    const results = resultsResult.status === 'fulfilled' ? resultsResult.value : [];
    const nonReleasedResults = results.filter(
      (r) => r.status !== 'Released' && r.status !== 'Cancelled'
    );
    const pendingResultsCount = nonReleasedResults.length;

    // Construct KPIs
    const metrics: DashboardStatMetric[] = [
      {
        id: 'total-patients',
        title: 'Total Patients',
        value: totalPatientsCount,
        description: 'Total active registered patients',
        iconName: 'Users',
        colorTheme: 'blue',
      },
      {
        id: 'today-lab-orders',
        title: "Today's Lab Orders",
        value: todayOrdersCount,
        description: 'Requisitions registered today',
        iconName: 'ClipboardList',
        colorTheme: 'emerald',
      },
      {
        id: 'pending-samples',
        title: 'Pending Samples',
        value: pendingSamplesCount,
        description: 'Specimens awaiting lab receipt',
        iconName: 'TestTube2',
        colorTheme: 'amber',
      },
      {
        id: 'pending-results',
        title: 'Pending Results',
        value: pendingResultsCount,
        description: 'Results awaiting release',
        iconName: 'Hourglass',
        colorTheme: 'purple',
      },
    ];

    // Recent Lab Orders (top 5 sorted by orderDate descending)
    const recentOrders: RecentLabOrder[] = [...orders]
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 5)
      .map((order) => ({
        id: String(order.id),
        orderNumber: order.orderNumber,
        patientName: order.patientName,
        patientId: order.patientNumber,
        tests: order.items?.map((item) => item.testNameSnapshot) || [],
        status: order.status,
        date: formatDate(order.orderDate),
        time: formatTimeOnly(order.orderDate),
      }));

    // Pending Results Queue (top 5 non-released results sorted by enteredAt/id descending)
    const pendingResults: PendingResultItem[] = [...nonReleasedResults]
      .sort((a, b) => {
        const timeA = a.enteredAt ? new Date(a.enteredAt).getTime() : a.id;
        const timeB = b.enteredAt ? new Date(b.enteredAt).getTime() : b.id;
        return (Number(timeB) || 0) - (Number(timeA) || 0);
      })
      .slice(0, 5)
      .map((result) => ({
        id: String(result.id),
        patientName: result.patientName,
        patientId: result.patientNumber,
        testName: result.testName,
        status: result.status as any,
        timeElapsed: formatTimeElapsed(result.enteredAt || result.collectedAt),
        resultFlag: result.resultFlag,
      }));

    return {
      metrics,
      recentOrders,
      pendingResults,
    };
  },
};
