import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import { receiptStorage, type Receipt } from '@/lib/storage-service';

export default function AdminDashboardScreen() {
  const { logout } = useAuth();
  const colors = useColors();
  const router = useRouter();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    receiptStorage.getAllReceipts().then((all) => {
      setReceipts(all);
      setIsLoading(false);
    });
  }, []);

  const totalRevenue = receipts.reduce((s, r) => s + (r.totalAmount || 0), 0);
  const completedCount = receipts.filter((r) => r.status === 'completed').length;
  const unsyncedCount = receipts.filter((r) => !r.synced).length;
  const now = new Date();
  const thisMonthReceipts = receipts.filter((r) => {
    const d = new Date(r.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthRevenue = thisMonthReceipts.reduce((s, r) => s + (r.totalAmount || 0), 0);
  const avgOrder = receipts.length > 0 ? totalRevenue / receipts.length : 0;

  // Top items by revenue
  const itemRevMap: Record<string, number> = {};
  for (const r of receipts) {
    for (const item of r.items || []) {
      const key = item.name.trim();
      if (!key) continue;
      itemRevMap[key] = (itemRevMap[key] || 0) + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0);
    }
  }
  const topItems = Object.entries(itemRevMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const recentReceipts = [...receipts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const fmt = (v: number) => `RM ${v.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const timeAgo = (iso: string) => {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <ScreenContainer containerClassName="flex-1" className="flex-1 p-0">
      <View className="px-6 py-4" style={{ backgroundColor: colors.foreground }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.primary }}>Admin Panel</Text>
            <Text className="text-2xl font-bold uppercase mt-1" style={{ color: '#fff' }}>Dashboard</Text>
          </View>
          <TouchableOpacity onPress={logout} className="px-4 py-2 rounded-lg" style={{ backgroundColor: colors.primary + '20', borderColor: colors.primary, borderWidth: 1 }}>
            <Text className="text-xs font-bold uppercase" style={{ color: colors.primary }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Revenue card */}
        <View className="mb-4 p-4 rounded-2xl" style={{ backgroundColor: colors.primary }}>
          <Text className="text-xs font-bold uppercase text-white opacity-70">Total Revenue</Text>
          <Text className="text-3xl font-bold text-white mt-1">{fmt(totalRevenue)}</Text>
          <View className="flex-row gap-6 mt-3">
            <View><Text className="text-xs text-white opacity-70">This Month</Text><Text className="text-base font-bold text-white">{fmt(thisMonthRevenue)}</Text></View>
            <View><Text className="text-xs text-white opacity-70">Avg Order</Text><Text className="text-base font-bold text-white">{fmt(avgOrder)}</Text></View>
            <View><Text className="text-xs text-white opacity-70">Mo. Orders</Text><Text className="text-base font-bold text-white">{thisMonthReceipts.length}</Text></View>
          </View>
        </View>

        {/* Metrics */}
        <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>Key Metrics</Text>
        <View className="gap-3 mb-6">
          <View className="flex-row gap-3">
            <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
              <Text className="text-xs font-bold uppercase" style={{ color: colors.muted }}>Total Receipts</Text>
              <Text className="text-2xl font-bold mt-2" style={{ color: colors.primary }}>{receipts.length}</Text>
            </View>
            <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
              <Text className="text-xs font-bold uppercase" style={{ color: colors.muted }}>Completed</Text>
              <Text className="text-2xl font-bold mt-2" style={{ color: colors.success }}>{completedCount}</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
              <Text className="text-xs font-bold uppercase" style={{ color: colors.muted }}>Unsynced</Text>
              <Text className="text-2xl font-bold mt-2" style={{ color: unsyncedCount > 0 ? colors.warning : colors.success }}>{unsyncedCount}</Text>
            </View>
            <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
              <Text className="text-xs font-bold uppercase" style={{ color: colors.muted }}>This Month</Text>
              <Text className="text-2xl font-bold mt-2" style={{ color: colors.foreground }}>{thisMonthReceipts.length}</Text>
            </View>
          </View>
        </View>

        {/* Top items */}
        {topItems.length > 0 && (
          <>
            <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>Top Items by Revenue</Text>
            <View className="mb-6 rounded-2xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
              {topItems.map(([name, rev], i) => (
                <View key={name} className="flex-row items-center justify-between px-4 py-3" style={{ borderBottomWidth: i < topItems.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
                  <View className="flex-row items-center gap-3">
                    <View className="w-7 h-7 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary + '20' }}>
                      <Text className="text-xs font-bold" style={{ color: colors.primary }}>{i + 1}</Text>
                    </View>
                    <Text className="font-semibold" style={{ color: colors.foreground }}>{name}</Text>
                  </View>
                  <Text className="font-bold" style={{ color: colors.primary }}>{fmt(rev)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Quick Actions */}
        <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>Quick Actions</Text>
        <View className="gap-3 mb-6">
          {[
            { id: 'receipts', label: 'View All Receipts', icon: '📋', color: colors.primary },
            { id: 'staff', label: 'Manage Staff', icon: '👥', color: colors.warning },
            { id: 'export', label: 'Export Data', icon: '📊', color: colors.success },
          ].map((action) => (
            <TouchableOpacity key={action.id} onPress={() => router.push(`/admin/${action.id === 'receipts' ? 'all-receipts' : action.id === 'staff' ? 'staff-management' : 'export-data'}` as any)} className="flex-row items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
              <View className="w-12 h-12 rounded-lg items-center justify-center" style={{ backgroundColor: action.color + '20' }}>
                <Text className="text-2xl">{action.icon}</Text>
              </View>
              <Text className="flex-1 font-bold uppercase" style={{ color: colors.foreground }}>{action.label}</Text>
              <Text className="text-lg" style={{ color: colors.muted }}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Receipts */}
        <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>Recent Receipts</Text>
        <View className="gap-2 pb-8">
          {recentReceipts.length === 0
            ? <View className="p-4 rounded-2xl items-center" style={{ backgroundColor: colors.surface }}><Text style={{ color: colors.muted }}>No receipts yet</Text></View>
            : recentReceipts.map((r) => (
              <TouchableOpacity key={r.id} onPress={() => router.push(`/receipt-detail?id=${r.id}`)} className="p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="font-bold" style={{ color: colors.foreground }}>{r.customerName}</Text>
                  <Text className="font-bold text-sm" style={{ color: colors.primary }}>{fmt(r.totalAmount || 0)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs" style={{ color: colors.muted }}>{r.location}</Text>
                  <Text className="text-xs" style={{ color: colors.muted }}>{timeAgo(r.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            ))
          }
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
