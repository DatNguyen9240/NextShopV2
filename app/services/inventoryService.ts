import axiosClient from '../lib/axiosClient';

export interface UpdateInventoryRequest {
  variantId: string;
  changeQty: number;
  reason?: string | null;
}

export interface InventoryTransactionDto {
  transactionId: string;
  variantId: string;
  variantSKU?: string | null;
  changeQty: number;
  reason?: string | null;
  createdAt: string;
  createdBy?: string | null;
}

export async function updateInventory(req: UpdateInventoryRequest) {
  const res = await axiosClient.post('/api/Inventory/update', req);
  return res.data?.data ?? res.data;
}

export async function getInventoryHistory(variantId: string): Promise<InventoryTransactionDto[]> {
  const res = await axiosClient.get(`/api/Inventory/history/${variantId}`);
  return res.data?.data ?? [];
}

export async function getCurrentStock(variantId: string): Promise<number> {
  const res = await axiosClient.get(`/api/Inventory/stock/${variantId}`);
  return res.data?.data ?? 0;
}
