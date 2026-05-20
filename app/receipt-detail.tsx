import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { useReceipts } from '@/lib/receipt-context';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { Receipt } from '@/lib/storage-service';

export default function ReceiptDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getReceipt, deleteReceipt, isOnline } = useReceipts();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReceipt = async () => {
      if (!id || typeof id !== 'string') {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getReceipt(id);
        setReceipt(data);
      } catch (error) {
        console.error('Error loading receipt:', error);
        Alert.alert('Error', 'Failed to load receipt');
      } finally {
        setIsLoading(false);
      }
    };

    loadReceipt();
  }, [id]);

  const handleDelete = () => {
    Alert.alert('Delete Receipt', 'Are you sure you want to delete this receipt?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!receipt) return;

          try {
            await deleteReceipt(receipt.id);
            Alert.alert('Success', 'Receipt deleted', [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete receipt');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!receipt) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text style={{ color: colors.muted }}>Receipt not found</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="flex-1" className="flex-1 p-0">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center gap-4" style={{ backgroundColor: colors.foreground }}>
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: colors.muted + '30' }}>
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold uppercase" style={{ color: '#fff' }}>
            Receipt #{receipt.id.slice(-8)}
          </Text>
          {!receipt.synced && (
            <Text className="text-xs mt-1" style={{ color: colors.warning }}>
              ⏳ Pending sync
            </Text>
          )}
        </View>
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
                {receipt.customerName}
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
                <Text className="font-semibold flex-1 text-right ml-2" style={{ color: colors.foreground }}>
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
                <Text style={{ color: colors.muted }}>🕐 Created:</Text>
                <Text className="font-semibold text-xs" style={{ color: colors.foreground }}>
                  {new Date(receipt.createdAt).toLocaleDateString()}
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

        {/* Sync Status */}
        {!receipt.synced && (
          <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.warning + '20' }}>
            <View className="flex-row items-center gap-2">
              <Text className="text-lg">📡</Text>
              <View className="flex-1">
                <Text className="text-xs font-bold uppercase" style={{ color: colors.warning }}>
                  Pending Sync
                </Text>
                <Text className="text-xs mt-1" style={{ color: colors.warning }}>
                  {isOnline ? 'Will sync shortly' : 'Will sync when online'}
                </Text>
              </View>
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
            onPress={handleDelete}
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
