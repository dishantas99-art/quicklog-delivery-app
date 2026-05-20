import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { receiptStorage, type Receipt, syncQueue } from './storage-service';
import { useAuth } from './auth-context';
import { useNetworkStatus } from '@/hooks/use-network-status';

interface ReceiptContextType {
  receipts: Receipt[];
  isLoading: boolean;
  error: string | null;
  createReceipt: (receipt: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Receipt>;
  updateReceipt: (id: string, updates: Partial<Receipt>) => Promise<Receipt | null>;
  deleteReceipt: (id: string) => Promise<boolean>;
  getReceipt: (id: string) => Promise<Receipt | null>;
  refreshReceipts: () => Promise<void>;
  unsyncedCount: number;
  isOnline: boolean;
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export function ReceiptProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  // Load receipts on mount and when user changes
  useEffect(() => {
    const loadReceipts = async () => {
      if (!user) {
        setReceipts([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        let loadedReceipts: Receipt[];
        if (user.role === 'admin') {
          loadedReceipts = await receiptStorage.getAllReceipts();
        } else {
          loadedReceipts = await receiptStorage.getStaffReceipts(user.id);
        }

        setReceipts(loadedReceipts);

        // Count unsynced items
        const unsynced = await receiptStorage.getUnsyncedReceipts();
        setUnsyncedCount(unsynced.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load receipts');
      } finally {
        setIsLoading(false);
      }
    };

    loadReceipts();
  }, [user]);

  // Attempt to sync when coming online
  useEffect(() => {
    if (isOnline && unsyncedCount > 0) {
      syncPendingReceipts();
    }
  }, [isOnline]);

  const refreshReceipts = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      let loadedReceipts: Receipt[];
      if (user.role === 'admin') {
        loadedReceipts = await receiptStorage.getAllReceipts();
      } else {
        loadedReceipts = await receiptStorage.getStaffReceipts(user.id);
      }

      setReceipts(loadedReceipts);

      const unsynced = await receiptStorage.getUnsyncedReceipts();
      setUnsyncedCount(unsynced.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh receipts');
    } finally {
      setIsLoading(false);
    }
  };

  const createReceipt = async (receipt: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newReceipt = await receiptStorage.createReceipt(receipt);
      setReceipts([...receipts, newReceipt]);

      // Update unsynced count
      const unsynced = await receiptStorage.getUnsyncedReceipts();
      setUnsyncedCount(unsynced.length);

      return newReceipt;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create receipt';
      setError(message);
      throw err;
    }
  };

  const updateReceipt = async (id: string, updates: Partial<Receipt>) => {
    try {
      setError(null);
      const updated = await receiptStorage.updateReceipt(id, updates);

      if (updated) {
        setReceipts(receipts.map((r) => (r.id === id ? updated : r)));

        const unsynced = await receiptStorage.getUnsyncedReceipts();
        setUnsyncedCount(unsynced.length);
      }

      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update receipt';
      setError(message);
      throw err;
    }
  };

  const deleteReceipt = async (id: string) => {
    try {
      setError(null);
      const success = await receiptStorage.deleteReceipt(id);

      if (success) {
        setReceipts(receipts.filter((r) => r.id !== id));

        const unsynced = await receiptStorage.getUnsyncedReceipts();
        setUnsyncedCount(unsynced.length);
      }

      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete receipt';
      setError(message);
      throw err;
    }
  };

  const getReceipt = async (id: string) => {
    try {
      return await receiptStorage.getReceipt(id);
    } catch (err) {
      console.error('Error fetching receipt:', err);
      return null;
    }
  };

  const syncPendingReceipts = async () => {
    try {
      const pendingItems = await syncQueue.getPendingItems();

      for (const item of pendingItems) {
        try {
          // TODO: Implement actual API sync
          // For now, just mark as synced
          await receiptStorage.markAsSynced(item.receiptId);
          await syncQueue.removeFromQueue(item.id);
        } catch (err) {
          await syncQueue.incrementRetry(item.id);
          console.error(`Failed to sync receipt ${item.receiptId}:`, err);
        }
      }

      const unsynced = await receiptStorage.getUnsyncedReceipts();
      setUnsyncedCount(unsynced.length);
    } catch (err) {
      console.error('Error syncing receipts:', err);
    }
  };

  return (
    <ReceiptContext.Provider
      value={{
        receipts,
        isLoading,
        error,
        createReceipt,
        updateReceipt,
        deleteReceipt,
        getReceipt,
        refreshReceipts,
        unsyncedCount,
        isOnline,
      }}
    >
      {children}
    </ReceiptContext.Provider>
  );
}

export function useReceipts() {
  const context = useContext(ReceiptContext);
  if (!context) {
    throw new Error('useReceipts must be used within a ReceiptProvider');
  }
  return context;
}
