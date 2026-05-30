import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReceiptItem {
  name: string;
  quantity: string;
  price: string;
}

export interface Receipt {
  id: string;
  staffId: string;
  customerName: string;
  location: string;
  date: string;
  status: 'draft' | 'completed' | 'pending';
  items: ReceiptItem[];
  totalAmount: number;
  notes: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export function computeTotal(items: ReceiptItem[]): number {
  return items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return sum + qty * price;
  }, 0);
}

const RECEIPTS_KEY = '@quicklog_receipts';
const SYNC_QUEUE_KEY = '@quicklog_sync_queue';

export const receiptStorage = {
  async getStaffReceipts(staffId: string): Promise<Receipt[]> {
    try {
      const data = await AsyncStorage.getItem(RECEIPTS_KEY);
      if (!data) return [];
      const receipts: Receipt[] = JSON.parse(data);
      return receipts.filter((r) => r.staffId === staffId);
    } catch { return []; }
  },

  async getAllReceipts(): Promise<Receipt[]> {
    try {
      const data = await AsyncStorage.getItem(RECEIPTS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch { return []; }
  },

  async getReceipt(id: string): Promise<Receipt | null> {
    try {
      const data = await AsyncStorage.getItem(RECEIPTS_KEY);
      if (!data) return null;
      const receipts: Receipt[] = JSON.parse(data);
      return receipts.find((r) => r.id === id) || null;
    } catch { return null; }
  },

  async createReceipt(receipt: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt' | 'totalAmount'>): Promise<Receipt> {
    const data = await AsyncStorage.getItem(RECEIPTS_KEY);
    const receipts: Receipt[] = data ? JSON.parse(data) : [];
    const newReceipt: Receipt = {
      ...receipt,
      totalAmount: computeTotal(receipt.items),
      id: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    receipts.push(newReceipt);
    await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
    if (!receipt.synced) await syncQueue.addToSyncQueue(newReceipt.id, 'create');
    return newReceipt;
  },

  async updateReceipt(id: string, updates: Partial<Receipt>): Promise<Receipt | null> {
    const data = await AsyncStorage.getItem(RECEIPTS_KEY);
    if (!data) return null;
    const receipts: Receipt[] = JSON.parse(data);
    const index = receipts.findIndex((r) => r.id === id);
    if (index === -1) return null;
    const merged = { ...receipts[index], ...updates };
    const updatedReceipt: Receipt = {
      ...merged,
      totalAmount: computeTotal(merged.items),
      updatedAt: new Date().toISOString(),
    };
    receipts[index] = updatedReceipt;
    await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
    if (!updatedReceipt.synced) await syncQueue.addToSyncQueue(id, 'update');
    return updatedReceipt;
  },

  async deleteReceipt(id: string): Promise<boolean> {
    const data = await AsyncStorage.getItem(RECEIPTS_KEY);
    if (!data) return false;
    const receipts: Receipt[] = JSON.parse(data);
    await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts.filter((r) => r.id !== id)));
    await syncQueue.addToSyncQueue(id, 'delete');
    return true;
  },

  async getUnsyncedReceipts(): Promise<Receipt[]> {
    const data = await AsyncStorage.getItem(RECEIPTS_KEY);
    if (!data) return [];
    const receipts: Receipt[] = JSON.parse(data);
    return receipts.filter((r) => !r.synced);
  },

  async markAsSynced(id: string): Promise<boolean> {
    const receipt = await this.getReceipt(id);
    if (!receipt) return false;
    await this.updateReceipt(id, { synced: true });
    return true;
  },

  async getDraftReceipts(staffId: string): Promise<Receipt[]> {
    const receipts = await this.getStaffReceipts(staffId);
    return receipts.filter((r) => r.status === 'draft');
  },

  async clearAllReceipts(): Promise<void> {
    await AsyncStorage.removeItem(RECEIPTS_KEY);
  },
};

interface SyncQueueItem {
  id: string;
  receiptId: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: string;
  retries: number;
}

export const syncQueue = {
  async addToSyncQueue(receiptId: string, operation: 'create' | 'update' | 'delete'): Promise<void> {
    const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    const queue: SyncQueueItem[] = data ? JSON.parse(data) : [];
    queue.push({
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      receiptId, operation,
      timestamp: new Date().toISOString(),
      retries: 0,
    });
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  },

  async getPendingItems(): Promise<SyncQueueItem[]> {
    const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  },

  async removeFromQueue(id: string): Promise<void> {
    const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!data) return;
    const queue: SyncQueueItem[] = JSON.parse(data);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue.filter((i) => i.id !== id)));
  },

  async incrementRetry(id: string): Promise<void> {
    const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!data) return;
    const queue: SyncQueueItem[] = JSON.parse(data);
    const item = queue.find((i) => i.id === id);
    if (item) {
      item.retries += 1;
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    }
  },

  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
  },
};
