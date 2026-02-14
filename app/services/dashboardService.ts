import axiosClient from '@/app/lib/axiosClient';

export interface DashboardMetrics {
  users: { total: number; newToday: number; newThisMonth: number };
  orders: { total: number; today: number; thisMonth: number; pending: number; completed: number };
  revenue: { total: number; today: number; thisMonth: number };
  products: { total: number; lowStock: number };
  inventory: { changesToday: number };
  notifications: { sentToday: number };
}

export interface AuditLogs {
  inventoryTransactions: any[];
  notificationHistory: any[];
  trackingEvents: any[];
}

export interface PerformanceMetrics {
  responseTimeAvg: number;
  errorRate: number;
  databaseConnections: number;
  cacheHitRate: number;
}

class DashboardService {
  async getMetrics(): Promise<DashboardMetrics> {
    const response = await axiosClient.get('/api/dashboard/metrics');
    return response.data;
  }

  async getAuditLogs(limit: number = 50): Promise<AuditLogs> {
    const response = await axiosClient.get(`/api/dashboard/audit-logs?limit=${limit}`);
    return response.data;
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const response = await axiosClient.get('/api/dashboard/performance');
    return response.data;
  }
}

export default new DashboardService();