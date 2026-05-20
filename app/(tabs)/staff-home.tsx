import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';

interface Receipt {
  id: string;
  customer: string;
  date: string;
  status: 'completed' | 'pending';
  itemCount: number;
}

export default function StaffHomeScreen() {
  const { user, logout } = useAuth();
  const colors = useColors();
  const router = useRouter();
  const [receipts, setReceipts] = useState<Receipt[]>([
    { id: '1', customer: 'John Doe', date: '2024-05-20', status: 'completed', itemCount: 3 },
    { id: '2', customer: 'Jane Smith', date: '2024-05-19', status: 'completed', itemCount: 2 },
  ]);

  const handleLogout = async () => {
    await logout();
  };

  const handleCreateReceipt = () => {
    router.push('/create-receipt');
  };

  const totalReceipts = receipts.length;
  const completedReceipts = receipts.filter(r => r.status === 'completed').length;
  const pendingReceipts = receipts.filter(r => r.status === 'pending').length;

  return (
    <ScreenContainer containerClassName="flex-1" className="flex-1 p-0">
      {/* Header */}
      <View className="px-6 py-4" style={{ backgroundColor: colors.foreground }}>
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.primary }}>
              Welcome Back
            </Text>
            <Text className="text-2xl font-bold uppercase mt-1" style={{ color: '#fff' }}>
              {user?.name || 'Staff'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: colors.primary + '20', borderColor: colors.primary, borderWidth: 1 }}
          >
            <Text className="text-xs font-bold uppercase" style={{ color: colors.primary }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-3">
          <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold uppercase" style={{ color: colors.muted }}>
              Total
            </Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.foreground }}>
              {totalReceipts}
            </Text>
          </View>
          <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold uppercase" style={{ color: colors.muted }}>
              Completed
            </Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.success }}>
              {completedReceipts}
            </Text>
          </View>
          <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold uppercase" style={{ color: colors.muted }}>
              Pending
            </Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.warning }}>
              {pendingReceipts}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Receipts */}
      <ScrollView className="flex-1 px-6 py-4">
        <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>
          Recent Receipts
        </Text>

        {receipts.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Text className="text-base" style={{ color: colors.muted }}>
              No receipts yet
            </Text>
          </View>
        ) : (
          <View className="gap-2 pb-32">
            {receipts.map((receipt) => (
              <TouchableOpacity
                key={receipt.id}
                onPress={() => router.push(`/receipt-detail?id=${receipt.id}`)}
                className="flex-row items-center gap-3 p-4 rounded-2xl"
                style={{ backgroundColor: colors.surface }}
              >
                <View
                  className="w-12 h-12 rounded-lg items-center justify-center"
                  style={{ backgroundColor: colors.foreground }}
                >
                  <Text className="text-xl">📦</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-bold uppercase" style={{ color: colors.foreground }}>
                    {receipt.customer}
                  </Text>
                  <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                    {receipt.date} • {receipt.itemCount} items
                  </Text>
                </View>
                <View
                  className="px-3 py-1 rounded-lg"
                  style={{
                    backgroundColor:
                      receipt.status === 'completed' ? colors.success + '20' : colors.warning + '20',
                  }}
                >
                  <Text
                    className="text-xs font-bold uppercase"
                    style={{
                      color: receipt.status === 'completed' ? colors.success : colors.warning,
                    }}
                  >
                    {receipt.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB - Create Receipt */}
      <TouchableOpacity
        onPress={handleCreateReceipt}
        className="absolute bottom-8 right-6 w-16 h-16 rounded-2xl items-center justify-center shadow-lg"
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="text-3xl">+</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
