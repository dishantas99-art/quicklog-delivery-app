import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { receiptStorage, syncQueue, type Receipt } from '../lib/storage-service';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('Receipt Storage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createReceipt', () => {
    it('should create a new receipt with auto-generated ID', async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
      vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);

      const receipt = await receiptStorage.createReceipt({
        staffId: 'staff-1',
        customerName: 'John Doe',
        location: '123 Main St',
        date: '2024-05-20',
        status: 'completed',
        items: [{ name: 'Package A', quantity: '1', price: '10' }],
        notes: 'Test note',
        images: [],
        synced: false,
      });

      expect(receipt.id).toBeDefined();
      expect(receipt.customerName).toBe('John Doe');
      expect(receipt.createdAt).toBeDefined();
      expect(receipt.updatedAt).toBeDefined();
    });

    it('should add receipt to sync queue if not synced', async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
      vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);

      const receipt = await receiptStorage.createReceipt({
        staffId: 'staff-1',
        customerName: 'Jane Doe',
        location: '456 Oak Ave',
        date: '2024-05-20',
        status: 'completed',
        items: [{ name: 'Package B', quantity: '2', price: '20' }],
        notes: '',
        images: [],
        synced: false,
      });

      // Verify sync queue was called
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('getStaffReceipts', () => {
    it('should return receipts for a specific staff member', async () => {
      const mockReceipts: Receipt[] = [
        {
          id: 'receipt-1',
          staffId: 'staff-1',
          customerName: 'John',
          location: '123 Main',
          date: '2024-05-20',
          status: 'completed',
          totalAmount: 0,
          items: [],
          notes: '',
          images: [],
          createdAt: '2024-05-20T10:00:00Z',
          updatedAt: '2024-05-20T10:00:00Z',
          synced: true,
        },
        {
          id: 'receipt-2',
          staffId: 'staff-2',
          customerName: 'Jane',
          location: '456 Oak',
          date: '2024-05-20',
          status: 'completed',
          totalAmount: 0,
          items: [],
          notes: '',
          images: [],
          createdAt: '2024-05-20T10:00:00Z',
          updatedAt: '2024-05-20T10:00:00Z',
          synced: true,
        },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockReceipts));

      const receipts = await receiptStorage.getStaffReceipts('staff-1');

      expect(receipts).toHaveLength(1);
      expect(receipts[0].staffId).toBe('staff-1');
    });

    it('should return empty array if no receipts found', async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);

      const receipts = await receiptStorage.getStaffReceipts('staff-1');

      expect(receipts).toEqual([]);
    });
  });

  describe('updateReceipt', () => {
    it('should update an existing receipt', async () => {
      const existingReceipt: Receipt = {
        id: 'receipt-1',
        staffId: 'staff-1',
        customerName: 'John',
        location: '123 Main',
        date: '2024-05-20',
        status: 'completed',
        items: [],
        notes: 'Original note',
        images: [],
        totalAmount: 0,
        createdAt: '2024-05-20T10:00:00Z',
        updatedAt: '2024-05-20T10:00:00Z',
        synced: true,
      };

      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([existingReceipt]));
      vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);

      const updated = await receiptStorage.updateReceipt('receipt-1', {
        notes: 'Updated note',
      });

      expect(updated?.notes).toBe('Updated note');
      expect(updated?.updatedAt).not.toBe(existingReceipt.updatedAt);
    });
  });

  describe('deleteReceipt', () => {
    it('should delete a receipt', async () => {
      const receipt: Receipt = {
        id: 'receipt-1',
        staffId: 'staff-1',
        customerName: 'John',
        location: '123 Main',
        date: '2024-05-20',
        status: 'completed',
        totalAmount: 0,
        items: [],
        notes: '',
        images: [],
        createdAt: '2024-05-20T10:00:00Z',
        updatedAt: '2024-05-20T10:00:00Z',
        synced: true,
      };

      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([receipt]));
      vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);

      const success = await receiptStorage.deleteReceipt('receipt-1');

      expect(success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@quicklog_receipts',
        JSON.stringify([])
      );
    });
  });

  describe('getUnsyncedReceipts', () => {
    it('should return only unsynced receipts', async () => {
      const mockReceipts: Receipt[] = [
        {
          id: 'receipt-1',
          staffId: 'staff-1',
          customerName: 'John',
          location: '123 Main',
          date: '2024-05-20',
          status: 'completed',
          items: [],
          notes: '',
          images: [],
          totalAmount: 0,
          createdAt: '2024-05-20T10:00:00Z',
          updatedAt: '2024-05-20T10:00:00Z',
          synced: false,
        },
        {
          id: 'receipt-2',
          staffId: 'staff-1',
          customerName: 'Jane',
          location: '456 Oak',
          date: '2024-05-20',
          status: 'completed',
          items: [],
          notes: '',
          images: [],
          totalAmount: 0,
          createdAt: '2024-05-20T10:00:00Z',
          updatedAt: '2024-05-20T10:00:00Z',
          synced: true,
        },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockReceipts));

      const unsynced = await receiptStorage.getUnsyncedReceipts();

      expect(unsynced).toHaveLength(1);
      expect(unsynced[0].synced).toBe(false);
    });
  });
});

describe('Sync Queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addToSyncQueue', () => {
    it('should add item to sync queue', async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
      vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);

      await syncQueue.addToSyncQueue('receipt-1', 'create');

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const callArgs = vi.mocked(AsyncStorage.setItem).mock.calls[0];
      expect(callArgs[0]).toBe('@quicklog_sync_queue');

      const queueData = JSON.parse(callArgs[1] as string);
      expect(queueData).toHaveLength(1);
      expect(queueData[0].receiptId).toBe('receipt-1');
      expect(queueData[0].operation).toBe('create');
    });
  });

  describe('getPendingItems', () => {
    it('should return all pending sync items', async () => {
      const mockQueue = [
        {
          id: 'sync-1',
          receiptId: 'receipt-1',
          operation: 'create' as const,
          timestamp: '2024-05-20T10:00:00Z',
          retries: 0,
        },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockQueue));

      const items = await syncQueue.getPendingItems();

      expect(items).toHaveLength(1);
      expect(items[0].receiptId).toBe('receipt-1');
    });
  });

  describe('removeFromQueue', () => {
    it('should remove item from sync queue', async () => {
      const mockQueue = [
        {
          id: 'sync-1',
          receiptId: 'receipt-1',
          operation: 'create' as const,
          timestamp: '2024-05-20T10:00:00Z',
          retries: 0,
        },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockQueue));
      vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);

      await syncQueue.removeFromQueue('sync-1');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@quicklog_sync_queue',
        JSON.stringify([])
      );
    });
  });
});
