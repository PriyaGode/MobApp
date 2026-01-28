import { API_BASE_URL } from '@/constants/api';
import {
    InventoryItem,
    InventoryItemCreateRequest,
    InventoryItemUpdateRequest,
    InventoryStatus,
    StockTransferRequest,
    UpdateQuantityRequest,
} from './types';

export async function getInventoryByHub(
  hubId: string,
  status?: InventoryStatus,
  search?: string
): Promise<InventoryItem[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (search) params.append('search', search);

  const url = `${API_BASE_URL}/hubs/${hubId}/inventory${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch inventory');
  }

  return response.json();
}

export async function getInventoryItem(hubId: string, itemId: string): Promise<InventoryItem> {
  const response = await fetch(`${API_BASE_URL}/hubs/${hubId}/inventory/${itemId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch inventory item');
  }

  return response.json();
}

export async function createInventoryItem(
  hubId: string,
  request: InventoryItemCreateRequest
): Promise<InventoryItem> {
  const response = await fetch(`${API_BASE_URL}/hubs/${hubId}/inventory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to create inventory item');
  }

  return response.json();
}

export async function updateInventoryItem(
  hubId: string,
  itemId: string,
  request: InventoryItemUpdateRequest
): Promise<InventoryItem> {
  const response = await fetch(`${API_BASE_URL}/hubs/${hubId}/inventory/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to update inventory item');
  }

  return response.json();
}

export async function updateQuantity(
  hubId: string,
  itemId: string,
  request: UpdateQuantityRequest
): Promise<InventoryItem> {
  const response = await fetch(`${API_BASE_URL}/hubs/${hubId}/inventory/${itemId}/quantity`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to update quantity');
  }

  return response.json();
}

export async function markOutOfStock(hubId: string, itemId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/hubs/${hubId}/inventory/${itemId}/mark-out-of-stock`,
    {
      method: 'PATCH',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to mark item as out of stock');
  }
}

export async function deleteInventoryItem(hubId: string, itemId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/hubs/${hubId}/inventory/${itemId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete inventory item');
  }
}

export async function getLowStockItems(hubId: string): Promise<InventoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/hubs/${hubId}/inventory/low-stock`);

  if (!response.ok) {
    throw new Error('Failed to fetch low stock items');
  }

  return response.json();
}

export async function transferStock(hubId: string, request: StockTransferRequest): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/hubs/${hubId}/inventory/transfer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to transfer stock');
  }
}
