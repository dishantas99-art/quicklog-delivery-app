import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
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

  useEffect(() => { refreshReceipts(); }, []);

  // Filter receipts for current staff member
  const staffReceipts = receipts.filter((r) => r.staffId === user?.id);
  const total     = staffReceipts.length;
  const completed = staffReceipts.filter((r) => r.status === 'completed').length;
  const pending   = staffReceipts.filter((r) => r.status === 'pending' || r.status === 'draft').length;

  const now = new Date();
  const todayCount = staffReceipts.filter((r) => {
    const d = new Date(r.createdAt);
    return d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
  }).length;

  const thisMonthCount = staffReceipts.filter((r) => {
    const d = new Date(r.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const recent = [...staffReceipts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const timeAgo = (iso: string) => {
    const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m / 60)}h ago`;
    return `${Math.floor(m / 1440)}d ago`;
  };

  return (
    <ScreenContainer containerClassName="flex-1" className="flex-1 p-0">

      {/* Header */}
      <View className="px-6 pt-4 pb-5" style={{ backgroundColor: colors.foreground }}>
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.primary }}>
              Welcome Back
            </Text>
            <Text className="text-2xl font-bold uppercase mt-0.5" style={{ color: '#fff' }}>
              {user?.name || 'Staff'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: colors.primary + '20', borderColor: colors.primary, borderWidth: 1 }}
          >
            <Text className="text-xs font-bold uppercase" style={{ color: colors.primary }}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Offline banner */}
        {!isOnline && (
          <View className="mb-4 p-3 rounded-xl flex-row items-center gap-2" style={{ backgroundColor: colors.warning + '20' }}>
            <Text>📡</Text>
            <View className="flex-1">
              <Text className="text-xs font-bold uppercase" style={{ color: colors.warning }}>Offline Mode</Text>
              <Text className="text-xs mt-0.5" style={{ color: colors.warning }}>
                {unsyncedCount > 0 ? `${unsyncedCount} receipt(s) pending sync` : 'Changes will sync when online'}
              </Text>
            </View>
          </View>
        )}

        {/* Activity summary */}
        <View className="p-4 rounded-2xl mb-3" style={{ backgroundColor: colors.primary + '25' }}>
          <Text className="text-xs font-bold uppercase" style={{ color: colors.primary }}>Your Activity</Text>
          <Text className="text-3xl font-bold mt-1" style={{ color: '#fff' }}>{total} Receipts</Text>
          <View className="flex-row gap-6 mt-2">
            <View>
              <Text className="text-xs opacity-70" style={{ color: '#fff' }}>Today</Text>
              <Text className="text-sm font-bold" style={{ color: '#fff' }}>
                {todayCount} receipt{todayCount !== 1 ? 's' : ''}
              </Text>
            </View>
            <View>
              <Text className="text-xs opacity-70" style={{ color: '#fff' }}>This Month</Text>
              <Text className="text-sm font-bold" style={{ color: '#fff' }}>
                {thisMonthCount} receipt{thisMonthCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Stat tiles */}
        <View className="flex-row gap-3">
          <View className="flex-1 p-3 rounded-xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold uppercase" style={{ color: colors.muted }}>Total</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.foreground }}>{total}</Text>
          </View>
          <View className="flex-1 p-3 rounded-xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold uppercase" style={{ color: colors.muted }}>Done</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.success }}>{completed}</Text>
          </View>
          <View className="flex-1 p-3 rounded-xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold uppercase" style={{ color: colors.muted }}>Pending</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.warning }}>{pending}</Text>
          </View>
          <View className="flex-1 p-3 rounded-xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold uppercase" style={{ color: colors.muted }}>Unsynced</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: unsyncedCount > 0 ? colors.warning : colors.success }}>
              {unsyncedCount}
            </Text>
          </View>
        </View>
      </View>

      {/* Receipt list */}
      <ScrollView className="flex-1 px-6 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.muted }}>
            My Receipts
          </Text>
          <TouchableOpacity
            onPress={refreshReceipts}
            disabled={isLoading}
            className="px-3 py-1 rounded-lg"
            style={{ backgroundColor: colors.primary + '20', opacity: isLoading ? 0.5 : 1 }}
          >
            <Text className="text-xs font-bold" style={{ color: colors.primary }}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : staffReceipts.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-4xl mb-3">📦</Text>
            <Text className="text-base font-bold" style={{ color: colors.muted }}>No receipts yet</Text>
            <Text className="text-xs mt-1 text-center" style={{ color: colors.muted }}>
              Tap the + button below to create your first receipt
            </Text>
          </View>
        ) : (
          <View className="gap-2 pb-32">
            {recent.map((receipt) => (
              <TouchableOpacity
                key={receipt.id}
                onPress={() => router.push(`/receipt-detail?id=${receipt.id}`)}
                className="p-4 rounded-2xl"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row items-start justify-between mb-1">
                  <View className="flex-1 mr-3">
                    <Text className="font-bold uppercase" style={{ color: colors.foreground }}>
                      {receipt.customerName}
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
                      {receipt.location} · {receipt.items.length} item{receipt.items.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View
                    className="px-2 py-0.5 rounded"
                    style={{
                      backgroundColor:
                        receipt.status === 'completed' ? colors.success + '20' : colors.warning + '20',
                    }}
                  >
                    <Text
                      className="text-xs font-bold uppercase"
                      style={{ color: receipt.status === 'completed' ? colors.success : colors.warning }}
                    >
                      {receipt.status}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between mt-1">
                  <Text className="text-xs" style={{ color: colors.muted }}>
                    {receipt.date} · {timeAgo(receipt.createdAt)}
                  </Text>
                  {!receipt.synced && (
                    <View className="flex-row items-center gap-1">
                      <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.warning }} />
                      <Text className="text-xs" style={{ color: colors.warning }}>Unsynced</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {staffReceipts.length > 10 && (
              <Text className="text-xs text-center py-2" style={{ color: colors.muted }}>
                Showing 10 of {staffReceipts.length} receipts
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/create-receipt')}
        style={{
          position: 'absolute',
          bottom: 32,
          right: 24,
          width: 64,
          height: 64,
          borderRadius: 16,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text className="text-3xl font-bold text-white leading-none">+</Text>
      </TouchableOpacity>

    </ScreenContainer>
  );
}
