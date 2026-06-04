/**
 * Turso API Client
 * 
 * Handles communication with the backend API for Turso database operations.
 * Provides methods for syncing receipts, staff, and other data.
 */

import type { Receipt, ReceiptItem } from './storage-service';

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface SyncPayload {
  receipts: Receipt[];
  staffId: string;
}

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

/**
 * Sync receipts to Turso database
 */
export async function syncReceiptsToTurso(payload: SyncPayload): Promise<APIResponse<{ synced: number }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/receipts/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Sync failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error('Sync error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error during sync',
    };
  }
}

/**
 * Create a receipt in Turso database
 */
export async function createReceiptInTurso(receipt: Receipt): Promise<APIResponse<Receipt>> {
  try {
    const response = await fetch(`${API_BASE_URL}/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(receipt),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to create receipt',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error('Create receipt error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Get all receipts from Turso database
 */
export async function getReceiptsFromTurso(): Promise<APIResponse<Receipt[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/receipts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to fetch receipts',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error('Fetch receipts error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Get staff receipts from Turso database
 */
export async function getStaffReceiptsFromTurso(staffId: string): Promise<APIResponse<Receipt[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/receipts/staff/${staffId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to fetch staff receipts',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error('Fetch staff receipts error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Update receipt in Turso database
 */
export async function updateReceiptInTurso(id: string, updates: Partial<Receipt>): Promise<APIResponse<Receipt>> {
  try {
    const response = await fetch(`${API_BASE_URL}/receipts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to update receipt',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error('Update receipt error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Delete receipt from Turso database
 */
export async function deleteReceiptFromTurso(id: string): Promise<APIResponse<{ deleted: boolean }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/receipts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to delete receipt',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error('Delete receipt error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Check sync status
 */
export async function getSyncStatus(): Promise<APIResponse<{ lastSync: string; pendingCount: number }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/sync/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to get sync status',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error('Sync status error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
