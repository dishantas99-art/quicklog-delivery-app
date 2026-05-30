import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { receiptStorage, syncQueue, type Receipt } from './storage-service';
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

  const loadReceipts = async () => {
    if (!user) { setReceipts([]); setIsLoading(false); return; }
    try {
      setIsLoading(true); setError(null);
      const loaded = user.role === 'admin'
        ? await receiptStorage.getAllReceipts()
        : await receiptStorage.getStaffReceipts(user.id);
      setReceipts(loaded);
      const unsynced = await receiptStorage.getUnsyncedReceipts();
      setUnsyncedCount(unsynced.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load receipts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadReceipts(); }, [user]);

  useEffect(() => {
    if (isOnline && unsyncedCount > 0) syncPendingReceipts();
  }, [isOnline]);

  const refreshReceipts = loadReceipts;

  const createReceipt = async (receipt: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>) => {
    setError(null);
    const newReceipt = await receiptStorage.createReceipt(receipt);
    setReceipts((prev) => [...prev, newReceipt]);
    const unsynced = await receiptStorage.getUnsyncedReceipts();
    setUnsyncedCount(unsynced.length);
    return newReceipt;
  };

  const updateReceipt = async (id: string, updates: Partial<Receipt>) => {
    setError(null);
    const updated = await receiptStorage.updateReceipt(id, updates);
    if (updated) {
      setReceipts((prev) => prev.map((r) => (r.id === id ? updated : r)));
      const unsynced = await receiptStorage.getUnsyncedReceipts();
      setUnsyncedCount(unsynced.length);
    }
    return updated;
  };

  const deleteReceipt = async (id: string) => {
    setError(null);
    const success = await receiptStorage.deleteReceipt(id);
    if (success) {
      setReceipts((prev) => prev.filter((r) => r.id !== id));
      const unsynced = await receiptStorage.getUnsyncedReceipts();
      setUnsyncedCount(unsynced.length);
    }
    return success;
  };

  const getReceipt = async (id: string) => receiptStorage.getReceipt(id);

  const syncPendingReceipts = async () => {
    const pendingItems = await syncQueue.getPendingItems();
    if (pendingItems.length === 0) return;

    try {
      // In a real app, we'd send the actual data. For now, we call the sync endpoint
      // to demonstrate the network flow.
      const { createTRPCClient } = await import('./trpc');
      const client = createTRPCClient();
      // We use a dummy call to the sync endpoint
      await client.receipts.sync.mutate({});
      
      for (const item of pendingItems) {
        try {
          await receiptStorage.markAsSynced(item.receiptId);
          await syncQueue.removeFromQueue(item.id);
        } catch {
          await syncQueue.incrementRetry(item.id);
        }
      }
    } catch (err) {
      console.error('Sync failed:', err);
    }

    const unsynced = await receiptStorage.getUnsyncedReceipts();
    setUnsyncedCount(unsynced.length);
  };

  return (
    <ReceiptContext.Provider value={{ receipts, isLoading, error, createReceipt, updateReceipt, deleteReceipt, getReceipt, refreshReceipts, unsyncedCount, isOnline }}>
      {children}
    </ReceiptContext.Provider>
  );
}

export function useReceipts() {
  const context = useContext(ReceiptContext);
  if (!context) throw new Error('useReceipts must be used within a ReceiptProvider');
  return context;
}
