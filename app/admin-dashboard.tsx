import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();
  const colors = useColors();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  const stats = {
    totalReceipts: 156,
    activeStaff: 12,
    pendingItems: 8,
    thisMonth: 89,
  };

  const dashboardActions = [
    { id: 'receipts', label: 'View All Receipts', icon: '📋', color: colors.primary },
    { id: 'staff', label: 'Manage Staff', icon: '👥', color: colors.warning },
    { id: 'export', label: 'Export Data', icon: '📊', color: colors.success },
  ];

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'receipts':
        router.push('/admin/all-receipts');
        break;
      case 'staff':
        router.push('/admin/staff-management');
        break;
      case 'export':
        router.push('/admin/export-data');
        break;
    }
  };

  return (
    <ScreenContainer containerClassName="flex-1" className="flex-1 p-0">
      {/* Header */}
      <View className="px-6 py-4" style={{ backgroundColor: colors.foreground }}>
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.primary }}>
              Admin Panel
            </Text>
            <Text className="text-2xl font-bold uppercase mt-1" style={{ color: '#fff' }}>
              Dashboard
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
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Key Metrics */}
        <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>
          Key Metrics
        </Text>

        <View className="gap-3 mb-6">
          <View className="flex-row gap-3">
            <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
              <Text className="text-xs font-bold uppercase" style={{ color: colors.muted }}>
                Total Receipts
              </Text>
              <Text className="text-2xl font-bold mt-2" style={{ color: colors.primary }}>
                {stats.totalReceipts}
              </Text>
            </View>
            <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
              <Text className="text-xs font-bold uppercase" style={{ color: colors.muted }}>
                Active Staff
              </Text>
              <Text className="text-2xl font-bold mt-2" style={{ color: colors.success }}>
                {stats.activeStaff}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
              <Text className="text-xs font-bold uppercase" style={{ color: colors.muted }}>
                Pending Items
              </Text>
              <Text className="text-2xl font-bold mt-2" style={{ color: colors.warning }}>
                {stats.pendingItems}
              </Text>
            </View>
            <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
              <Text className="text-xs font-bold uppercase" style={{ color: colors.muted }}>
                This Month
              </Text>
              <Text className="text-2xl font-bold mt-2" style={{ color: colors.foreground }}>
                {stats.thisMonth}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>
          Quick Actions
        </Text>

        <View className="gap-3 mb-8">
          {dashboardActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              onPress={() => handleAction(action.id)}
              className="flex-row items-center gap-4 p-4 rounded-2xl"
              style={{ backgroundColor: colors.surface }}
            >
              <View
                className="w-12 h-12 rounded-lg items-center justify-center"
                style={{ backgroundColor: action.color + '20' }}
              >
                <Text className="text-2xl">{action.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold uppercase" style={{ color: colors.foreground }}>
                  {action.label}
                </Text>
              </View>
              <Text className="text-lg" style={{ color: colors.muted }}>
                →
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>
          Recent Activity
        </Text>

        <View className="gap-2 pb-8">
          {[
            { staff: 'John Smith', action: 'Created receipt', time: '2 hours ago' },
            { staff: 'Sarah Johnson', action: 'Created receipt', time: '4 hours ago' },
            { staff: 'Mike Davis', action: 'Created receipt', time: '1 day ago' },
          ].map((activity, index) => (
            <View
              key={index}
              className="p-4 rounded-2xl flex-row items-center justify-between"
              style={{ backgroundColor: colors.surface }}
            >
              <View>
                <Text className="font-bold" style={{ color: colors.foreground }}>
                  {activity.staff}
                </Text>
                <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                  {activity.action}
                </Text>
              </View>
              <Text className="text-xs" style={{ color: colors.muted }}>
                {activity.time}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
