export type TransferStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface TransferRequest {
  id: string;
  requestId: string;
  sourceHubName: string;
  sourceHubCode: string;
  destinationHubName: string;
  destinationHubCode: string;
  sku: string;
  itemName: string;
  quantity: number;
  status: TransferStatus;
  requestedBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface TransferRequestDecision {
  decision: 'APPROVED' | 'REJECTED';
  approvedBy: string;
  notes?: string;
}