import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  login: (phone: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo accounts — replace with real API auth in production
const ACCOUNTS: Array<User & { pin: string }> = [
  { id: 'admin_1', phone: '0100000000', pin: '1234', name: 'Admin User', role: 'admin' },
  { id: 'staff_1', phone: '0111111111', pin: '1111', name: 'John Smith', role: 'staff' },
  { id: 'staff_2', phone: '0122222222', pin: '2222', name: 'Sarah Johnson', role: 'staff' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        const userData = await AsyncStorage.getItem('userData');
        if (token && userData) setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to restore session:', e);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  const login = async (phone: string, pin: string) => {
    setIsLoading(true);
    try {
      const account = ACCOUNTS.find(
        (a) => a.phone === phone.trim() && a.pin === pin.trim()
      );
      if (!account) throw new Error('Invalid phone number or PIN');
      const { pin: _pin, ...loggedInUser } = account;
      await SecureStore.setItemAsync('authToken', 'token-' + Date.now());
      await AsyncStorage.setItem('userData', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } catch (e) {
      throw e instanceof Error ? e : new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('authToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isSignedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
