import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReceiptItem {
  name: string;
  quantity: string;
  price: string; // unit price as string (e.g. "12.50")
}

export interface Receipt {
  id: string;
  staffId: string;
  customerName: string;
  location: string;
  date: string;
  status: 'draft' | 'completed' | 'pending';
  items: ReceiptItem[];
  totalAmount: number; // computed total
  notes: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  status: 'active' | 'inactive';
}

const RECEIPTS_KEY = '@quicklog_receipts';
const STAFF_KEY = '@quicklog_staff';
const SYNC_QUEUE_KEY = '@quicklog_sync_queue';

/** Compute total from items array */
export function computeTotal(items: ReceiptItem[]): number {
  return items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return sum + qty * price;
  }, 0);
}

export const receiptStorage = {
  async getStaffReceipts(staffId: string): Promise<Receipt[]> {
    try {
      const data = await AsyncStorage.getItem(RECEIPTS_KEY);
      if (!data) return [];
      const receipts: Receipt[] = JSON.parse(data);
      return receipts.filter((r) => r.staffId === staffId);
    } catch (error) {
      console.error('Error fetching staff receipts:', error);
      return [];
    }
  },

  async getAllReceipts(): Promise<Receipt[]> {
    try {
      const data = await AsyncStorage.getItem(RECEIPTS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Error fetching all receipts:', error);
      return [];
    }
  },

  async getReceipt(id: string): Promise<Receipt | null> {
    try {
      const data = await AsyncStorage.getItem(RECEIPTS_KEY);
      if (!data) return null;
      const receipts: Receipt[] = JSON.parse(data);
      return receipts.find((r) => r.id === id) || null;
    } catch (error) {
      console.error('Error fetching receipt:', error);
      return null;
    }
  },

  async createReceipt(receipt: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Receipt> {
    try {
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

      if (!receipt.synced) {
        await syncQueue.addToSyncQueue(newReceipt.id, 'create');
      }

      return newReceipt;
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  },

  async updateReceipt(id: string, updates: Partial<Receipt>): Promise<Receipt | null> {
    try {
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

      if (!updatedReceipt.synced) {
        await syncQueue.addToSyncQueue(id, 'update');
      }

      return updatedReceipt;
    } catch (error) {
      console.error('Error updating receipt:', error);
      return null;
    }
  },

  async deleteReceipt(id: string): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(RECEIPTS_KEY);
      if (!data) return false;

      const receipts: Receipt[] = JSON.parse(data);
      await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts.filter((r) => r.id !== id)));
      await syncQueue.addToSyncQueue(id, 'delete');
      return true;
    } catch (error) {
      console.error('Error deleting receipt:', error);
      return false;
    }
  },

  async getDraftReceipts(staffId: string): Promise<Receipt[]> {
    const receipts = await this.getStaffReceipts(staffId);
    return receipts.filter((r) => r.status === 'draft');
  },

  async getUnsyncedReceipts(): Promise<Receipt[]> {
    try {
      const data = await AsyncStorage.getItem(RECEIPTS_KEY);
      if (!data) return [];
      const receipts: Receipt[] = JSON.parse(data);
      return receipts.filter((r) => !r.synced);
    } catch (error) {
      console.error('Error fetching unsynced receipts:', error);
      return [];
    }
  },

  async markAsSynced(id: string): Promise<boolean> {
    const receipt = await this.getReceipt(id);
    if (!receipt) return false;
    await this.updateReceipt(id, { synced: true });
    return true;
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
    try {
      const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      const queue: SyncQueueItem[] = data ? JSON.parse(data) : [];
      queue.push({
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        receiptId,
        operation,
        timestamp: new Date().toISOString(),
        retries: 0,
      });
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  },

  async getPendingItems(): Promise<SyncQueueItem[]> {
    try {
      const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  },

  async removeFromQueue(id: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (!data) return;
      const queue: SyncQueueItem[] = JSON.parse(data);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue.filter((i) => i.id !== id)));
    } catch (error) {
      console.error('Error removing from sync queue:', error);
    }
  },

  async incrementRetry(id: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (!data) return;
      const queue: SyncQueueItem[] = JSON.parse(data);
      const item = queue.find((i) => i.id === id);
      if (item) {
        item.retries += 1;
        await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      }
    } catch (error) {
      console.error('Error incrementing retry:', error);
    }
  },

  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
  },
};
