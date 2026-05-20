import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Receipt {
  id: string;
  staffId: string;
  customerName: string;
  location: string;
  date: string;
  status: 'draft' | 'completed' | 'pending';
  items: Array<{ name: string; quantity: string }>;
  notes: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  synced: boolean; // Track if synced to backend
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

const RECEIPTS_KEY = '@quicklog_receipts';
const STAFF_KEY = '@quicklog_staff';
const SYNC_QUEUE_KEY = '@quicklog_sync_queue';

/**
 * Receipt Storage Service
 * Handles local persistence of receipts with offline support
 */
export const receiptStorage = {
  /**
   * Get all receipts for a specific staff member
   */
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

  /**
   * Get all receipts (admin view)
   */
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

  /**
   * Get a single receipt by ID
   */
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

  /**
   * Create a new receipt
   */
  async createReceipt(receipt: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Receipt> {
    try {
      const data = await AsyncStorage.getItem(RECEIPTS_KEY);
      const receipts: Receipt[] = data ? JSON.parse(data) : [];

      const newReceipt: Receipt = {
        ...receipt,
        id: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      receipts.push(newReceipt);
      await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));

      // Add to sync queue if not already synced
      if (!receipt.synced) {
        await syncQueue.addToSyncQueue(newReceipt.id, 'create');
      }

      return newReceipt;
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  },

  /**
   * Update an existing receipt
   */
  async updateReceipt(id: string, updates: Partial<Receipt>): Promise<Receipt | null> {
    try {
      const data = await AsyncStorage.getItem(RECEIPTS_KEY);
      if (!data) return null;

      const receipts: Receipt[] = JSON.parse(data);
      const index = receipts.findIndex((r) => r.id === id);

      if (index === -1) return null;

      const updatedReceipt: Receipt = {
        ...receipts[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      receipts[index] = updatedReceipt;
      await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));

      // Add to sync queue
      if (!updatedReceipt.synced) {
        await syncQueue.addToSyncQueue(id, 'update');
      }

      return updatedReceipt;
    } catch (error) {
      console.error('Error updating receipt:', error);
      return null;
    }
  },

  /**
   * Delete a receipt
   */
  async deleteReceipt(id: string): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(RECEIPTS_KEY);
      if (!data) return false;

      const receipts: Receipt[] = JSON.parse(data);
      const filteredReceipts = receipts.filter((r) => r.id !== id);

      await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(filteredReceipts));

      // Add to sync queue
      await syncQueue.addToSyncQueue(id, 'delete');

      return true;
    } catch (error) {
      console.error('Error deleting receipt:', error);
      return false;
    }
  },

  /**
   * Get draft receipts (unsaved)
   */
  async getDraftReceipts(staffId: string): Promise<Receipt[]> {
    try {
      const receipts = await this.getStaffReceipts(staffId);
      return receipts.filter((r) => r.status === 'draft');
    } catch (error) {
      console.error('Error fetching draft receipts:', error);
      return [];
    }
  },

  /**
   * Get unsynced receipts
   */
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

  /**
   * Mark receipt as synced
   */
  async markAsSynced(id: string): Promise<boolean> {
    try {
      const receipt = await this.getReceipt(id);
      if (!receipt) return false;

      await this.updateReceipt(id, { synced: true });
      return true;
    } catch (error) {
      console.error('Error marking receipt as synced:', error);
      return false;
    }
  },

  /**
   * Clear all receipts (use with caution)
   */
  async clearAllReceipts(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECEIPTS_KEY);
    } catch (error) {
      console.error('Error clearing receipts:', error);
    }
  },
};

/**
 * Sync Queue Management
 * Tracks operations that need to be synced to backend
 */
interface SyncQueueItem {
  id: string;
  receiptId: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: string;
  retries: number;
}

export const syncQueue = {
  /**
   * Add item to sync queue
   */
  async addToSyncQueue(receiptId: string, operation: 'create' | 'update' | 'delete'): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      const queue: SyncQueueItem[] = data ? JSON.parse(data) : [];

      const item: SyncQueueItem = {
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        receiptId,
        operation,
        timestamp: new Date().toISOString(),
        retries: 0,
      };

      queue.push(item);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  },

  /**
   * Get all pending sync items
   */
  async getPendingItems(): Promise<SyncQueueItem[]> {
    try {
      const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Error fetching sync queue:', error);
      return [];
    }
  },

  /**
   * Remove item from sync queue
   */
  async removeFromQueue(id: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (!data) return;

      const queue: SyncQueueItem[] = JSON.parse(data);
      const filtered = queue.filter((item) => item.id !== id);

      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from sync queue:', error);
    }
  },

  /**
   * Increment retry count
   */
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

  /**
   * Clear sync queue
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  },
};

// Extend receiptStorage with addToSyncQueue method
(receiptStorage as any).addToSyncQueue = syncQueue.addToSyncQueue;
