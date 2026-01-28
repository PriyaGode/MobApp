export enum InventoryStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  REORDER_NEEDED = 'REORDER_NEEDED',
}

export interface InventoryItem {
  id: string;
  hubId: string;
  hubName: string;
  sku: string;
  productName: string;
  quantity: number;
  reorderLevel: number;
  status: InventoryStatus;
  description?: string;
  unitPrice?: number;
  unit?: string;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemCreateRequest {
  sku: string;
  productName: string;
  quantity: number;
  reorderLevel: number;
  description?: string;
  unitPrice?: number;
  unit?: string;
}

export interface InventoryItemUpdateRequest {
  productName: string;
  quantity: number;
  reorderLevel: number;
  description?: string;
  unitPrice?: number;
  unit?: string;
}

export interface UpdateQuantityRequest {
  quantity: number;
}

export interface StockTransferRequest {
  sourceHubId: string;
  destinationHubId: string;
  sku: string;
  quantity: number;
  notes?: string;
}
