import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ReceiptDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Mock receipt data
  const receipt = {
    id: id || '1',
    customer: 'John Doe',
    staff: 'Alice Smith',
    location: '123 Main St, City',
    date: '2024-05-20',
    status: 'completed' as const,
    items: [
      { name: 'Package A', quantity: '1' },
      { name: 'Package B', quantity: '2' },
      { name: 'Document', quantity: '1' },
    ],
    notes: 'Delivered to front desk',
    images: [],
  };

  return (
    <ScreenContainer containerClassName="flex-1" className="flex-1 p-0">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center gap-4" style={{ backgroundColor: colors.foreground }}>
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: colors.muted + '30' }}>
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold uppercase" style={{ color: '#fff' }}>
          Receipt #{receipt.id}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Receipt Info */}
        <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.muted }}>
                Customer
              </Text>
              <Text className="text-lg font-bold mt-1" style={{ color: colors.foreground }}>
                {receipt.customer}
              </Text>
            </View>
            <View
              className="px-3 py-1 rounded-lg"
              style={{
                backgroundColor: receipt.status === 'completed' ? colors.success + '20' : colors.warning + '20',
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
          </View>

          <View className="pt-4 border-t" style={{ borderColor: colors.border }}>
            <Text className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: colors.muted }}>
              Delivery Details
            </Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text style={{ color: colors.muted }}>📍 Location:</Text>
                <Text className="font-semibold" style={{ color: colors.foreground }}>
                  {receipt.location}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.muted }}>📅 Date:</Text>
                <Text className="font-semibold" style={{ color: colors.foreground }}>
                  {receipt.date}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.muted }}>👤 Staff:</Text>
                <Text className="font-semibold" style={{ color: colors.foreground }}>
                  {receipt.staff}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Items */}
        <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
          <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>
            Items ({receipt.items.length})
          </Text>

          <View className="gap-2">
            {receipt.items.map((item, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: colors.background }}
              >
                <Text className="font-semibold" style={{ color: colors.foreground }}>
                  {item.name}
                </Text>
                <View className="px-3 py-1 rounded-lg" style={{ backgroundColor: colors.primary + '20' }}>
                  <Text className="text-xs font-bold" style={{ color: colors.primary }}>
                    Qty: {item.quantity}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Notes */}
        {receipt.notes && (
          <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: colors.muted }}>
              Notes
            </Text>
            <Text style={{ color: colors.foreground }}>
              {receipt.notes}
            </Text>
          </View>
        )}

        {/* Images */}
        {receipt.images.length > 0 && (
          <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>
              Photos ({receipt.images.length})
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {receipt.images.map((_, index) => (
                <View
                  key={index}
                  className="w-20 h-20 rounded-lg items-center justify-center"
                  style={{ backgroundColor: colors.primary + '20' }}
                >
                  <Text className="text-2xl">📷</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity
            className="flex-1 py-3 rounded-lg items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-sm font-bold uppercase text-white">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-3 rounded-lg items-center justify-center"
            style={{ backgroundColor: colors.error + '20', borderColor: colors.error, borderWidth: 1 }}
          >
            <Text className="text-sm font-bold uppercase" style={{ color: colors.error }}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
