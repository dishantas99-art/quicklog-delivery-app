import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { useReceipts } from '@/lib/receipt-context';
import { useColors } from '@/hooks/use-colors';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';

export default function StaffHomeScreen() {
  const { user, logout } = useAuth();
  const { receipts, isLoading, refreshReceipts, unsyncedCount, isOnline } = useReceipts();
  const colors = useColors();
  const router = useRouter();

  useEffect(() => {
    refreshReceipts();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleCreateReceipt = () => {
    router.push('/create-receipt');
  };

  const handleRefresh = async () => {
    await refreshReceipts();
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

        {/* Offline Banner */}
        {!isOnline && (
          <View className="mb-4 p-3 rounded-lg flex-row items-center gap-2" style={{ backgroundColor: colors.warning + '20' }}>
            <Text style={{ color: colors.warning }}>📡</Text>
            <View className="flex-1">
              <Text className="text-xs font-bold uppercase" style={{ color: colors.warning }}>
                Offline Mode
              </Text>
              <Text className="text-xs" style={{ color: colors.warning }}>
                {unsyncedCount > 0 ? `${unsyncedCount} receipt(s) waiting to sync` : 'Changes will sync when online'}
              </Text>
            </View>
          </View>
        )}

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
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.muted }}>
            Recent Receipts
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={isLoading}
            className="px-3 py-1 rounded-lg"
            style={{ backgroundColor: colors.primary + '20', opacity: isLoading ? 0.5 : 1 }}
          >
            <Text className="text-xs font-bold" style={{ color: colors.primary }}>
              ↻ Refresh
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : receipts.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Text className="text-base" style={{ color: colors.muted }}>
              No receipts yet
            </Text>
            <Text className="text-xs mt-2" style={{ color: colors.muted }}>
              Tap the + button to create your first receipt
            </Text>
          </View>
        ) : (
          <View className="gap-2 pb-32">
            {receipts.map((receipt) => (
              <TouchableOpacity
                key={receipt.id}
                onPress={() => router.push(`/receipt-detail?id=${receipt.id}`)}
                className="flex-row items-center gap-3 p-4 rounded-2xl relative"
                style={{ backgroundColor: colors.surface }}
              >
                {!receipt.synced && (
                  <View
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors.warning }}
                  />
                )}
                <View
                  className="w-12 h-12 rounded-lg items-center justify-center"
                  style={{ backgroundColor: colors.foreground }}
                >
                  <Text className="text-xl">📦</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-bold uppercase" style={{ color: colors.foreground }}>
                    {receipt.customerName}
                  </Text>
                  <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                    {receipt.date} • {receipt.items.length} items
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
