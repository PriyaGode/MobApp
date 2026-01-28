export type OrderSummary = {
  id: number;
  customerName?: string | null;
  productName?: string | null;
  productImageUrl?: string | null;
  hubName?: string | null;
  deliveryPartnerName?: string | null;
  status: string;
  createdAt: string;
  issueFlag: boolean;
  totalAmount?: number | null;
};

export type OrderDetails = OrderSummary & {
  placedByUserName?: string | null;
  paymentMethod?: string | null;
  paymentId?: string | null;
  productNames?: string[]; // full list of products in this order (summary omits products)
  deliveryStage?: string; // granular stage (pending, processing, in-transit, out-for-delivery, delivered, cancelled)
  deliverySteps?: string[]; // full ordered list of steps for timeline
};

export type OrdersResponse = {
  content: OrderSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  empty: boolean;
};

import { API_BASE } from './apiBase';

export type OrdersQuery = {
  status?: string;
  hub?: number;
  deliveryPartner?: number;
  dateRange?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string; // e.g., createdAt,desc
  issue?: boolean;
};

export async function listOrders(query: OrdersQuery = {}): Promise<OrdersResponse> {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (typeof query.hub === 'number') params.set('hub', String(query.hub));
  if (typeof query.deliveryPartner === 'number') params.set('deliveryPartner', String(query.deliveryPartner));
  if (query.dateRange) params.set('dateRange', query.dateRange);
  if (query.search) params.set('search', query.search);
  if (query.issue === true) params.set('issue', 'true');
  params.set('page', String(query.page ?? 0));
  params.set('size', String(query.size ?? 20));
  params.set('sort', query.sort ?? 'createdAt,desc');

  const url = `${API_BASE}/api/admin/orders?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch orders: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getOrderDetails(id: number): Promise<OrderDetails> {
  const url = `${API_BASE}/api/admin/orders/${id}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch order ${id}: ${res.status} ${text}`);
  }
  return res.json();
}

export async function updateOrderDeliveryPartner(orderId: number, deliveryPartnerId: number | null): Promise<OrderDetails> {
  const url = `${API_BASE}/api/admin/orders/${orderId}/delivery-partner`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deliveryPartnerId })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update delivery partner: ${res.status} ${text}`);
  }
  return res.json();
}

export async function updateOrderStatus(orderId: number, status: string): Promise<OrderDetails> {
  const url = `${API_BASE}/api/admin/orders/${orderId}/status`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update order status: ${res.status} ${text}`);
  }
  return res.json();
}
