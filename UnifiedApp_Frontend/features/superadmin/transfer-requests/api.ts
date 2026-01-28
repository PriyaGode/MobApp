import { API_BASE_URL } from '@/constants/api';
import { TransferRequest, TransferRequestDecision, TransferStatus } from './types';

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const transferRequestsApi = {
  async getTransferRequests(status?: TransferStatus, page = 0, size = 20): Promise<PagedResponse<TransferRequest>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await fetch(`${API_BASE_URL}/transfer-requests?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch transfer requests');
    }
    return response.json();
  },

  async getPendingCount(): Promise<{ count: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/transfer-requests/pending-count`);
      if (!response.ok) {
        // Return 0 if endpoint doesn't exist yet
        return { count: 0 };
      }
      return response.json();
    } catch (error) {
      // Return 0 on any error (endpoint not implemented yet)
      return { count: 0 };
    }
  },

  async processTransferRequest(requestId: string, decision: TransferRequestDecision): Promise<TransferRequest> {
    const response = await fetch(`${API_BASE_URL}/transfer-requests/${requestId}/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(decision),
    });
    
    if (!response.ok) {
      throw new Error('Failed to process transfer request');
    }
    return response.json();
  },
};