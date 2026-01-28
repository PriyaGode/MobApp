import { SUPERADMIN_API_BASE_URL } from '../config';

export type AuditLog = {
  id: string;
  userId: string;
  actionType: string;
  timestamp: string;
  hubId?: string;
  regionSnapshot?: string;
  ipAddress?: string;
  summary?: string;
};

export type AuditLogQuery = {
  userId?: string;
  actionType?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  search?: string;
  page?: number;
  size?: number;
};

export type AuditLogResponsePage = {
  content: AuditLog[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  todayCount: number;
};

export async function fetchAuditLogs(query: AuditLogQuery): Promise<AuditLogResponsePage> {
  const params = new URLSearchParams();
  if (query.page != null) params.append('page', String(query.page)); else params.append('page', '0');
  if (query.size != null) params.append('size', String(query.size)); else params.append('size', '20');
  if (query.userId) params.append('userId', query.userId.trim());
  if (query.actionType) params.append('actionType', query.actionType.trim());
  if (query.startDate) params.append('startDate', query.startDate.trim());
  if (query.endDate) params.append('endDate', query.endDate.trim());
  if (query.search) params.append('search', query.search.trim());

  const res = await fetch(`${SUPERADMIN_API_BASE_URL}/audit-logs/logs?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch audit logs: ${res.status}`);
  }
  return res.json();
}
