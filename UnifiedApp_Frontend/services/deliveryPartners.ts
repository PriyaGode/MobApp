import { API_BASE } from './apiBase';

export type DeliveryPartner = { id: number; name: string };

export async function listDeliveryPartners(): Promise<DeliveryPartner[]> {
  const url = `${API_BASE}/api/delivery-partners`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch delivery partners: ${res.status} ${text}`);
  }
  return res.json();
}
