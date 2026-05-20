import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        setIsOnline(state.isConnected ?? true);
      } catch (error) {
        console.error('Error checking network status:', error);
        setIsOnline(true); // Assume online on error
      } finally {
        setIsLoading(false);
      }
    };

    checkNetworkStatus();

    // Subscribe to network changes
    const subscription = Network.addNetworkStateListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return { isOnline, isLoading };
}
