import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
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
    const load = async () => {
      if (!id || typeof id !== 'string') { setIsLoading(false); return; }
      try { setReceipt(await getReceipt(id)); }
      catch { Alert.alert('Error', 'Failed to load receipt'); }
      finally { setIsLoading(false); }
    };
    load();
  }, [id, getReceipt]);

  const handleDelete = () => {
    Alert.alert('Delete Receipt', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        if (!receipt) return;
        try {
          await deleteReceipt(receipt.id);
          Alert.alert('Success', 'Receipt deleted', [{ text: 'OK', onPress: () => router.back() }]);
        } catch { Alert.alert('Error', 'Failed to delete receipt'); }
      }},
    ]);
  };

  const fmt = (v: number) => `RM ${v.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (isLoading) return <ScreenContainer className="flex-1 items-center justify-center"><ActivityIndicator size="large" color={colors.primary} /></ScreenContainer>;
  if (!receipt) return <ScreenContainer className="flex-1 items-center justify-center"><Text style={{ color: colors.muted }}>Receipt not found</Text></ScreenContainer>;

  return (
    <ScreenContainer containerClassName="flex-1" className="flex-1 p-0">
      <View className="px-6 py-4 flex-row items-center gap-4" style={{ backgroundColor: colors.foreground }}>
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: colors.muted + '30' }}>
          <Text className="text-xl text-white">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold uppercase" style={{ color: '#fff' }}>Receipt #{receipt.id.slice(-8)}</Text>
          {!receipt.synced && <Text className="text-xs mt-1" style={{ color: colors.warning }}>⏳ Pending sync</Text>}
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Info */}
        <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.muted }}>Customer</Text>
              <Text className="text-lg font-bold mt-1" style={{ color: colors.foreground }}>{receipt.customerName}</Text>
            </View>
            <View className="px-3 py-1 rounded-lg" style={{ backgroundColor: receipt.status === 'completed' ? colors.success + '20' : colors.warning + '20' }}>
              <Text className="text-xs font-bold uppercase" style={{ color: receipt.status === 'completed' ? colors.success : colors.warning }}>{receipt.status}</Text>
            </View>
          </View>
          <View className="gap-2 pt-4 border-t" style={{ borderColor: colors.border }}>
            <View className="flex-row justify-between"><Text style={{ color: colors.muted }}>📍 Location:</Text><Text className="font-semibold flex-1 text-right ml-2" style={{ color: colors.foreground }}>{receipt.location}</Text></View>
            <View className="flex-row justify-between"><Text style={{ color: colors.muted }}>📅 Date:</Text><Text className="font-semibold" style={{ color: colors.foreground }}>{receipt.date}</Text></View>
            <View className="flex-row justify-between"><Text style={{ color: colors.muted }}>🕐 Created:</Text><Text className="font-semibold text-xs" style={{ color: colors.foreground }}>{new Date(receipt.createdAt).toLocaleString()}</Text></View>
          </View>
        </View>

        {/* Items with pricing */}
        <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
          <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>Items ({receipt.items.length})</Text>
          <View className="flex-row mb-2 px-1">
            <Text className="flex-1 text-xs font-bold uppercase" style={{ color: colors.muted }}>Item</Text>
            <Text className="w-12 text-xs font-bold uppercase text-center" style={{ color: colors.muted }}>Qty</Text>
            <Text className="w-20 text-xs font-bold uppercase text-right" style={{ color: colors.muted }}>Price</Text>
            <Text className="w-20 text-xs font-bold uppercase text-right" style={{ color: colors.muted }}>Total</Text>
          </View>
          <View className="gap-2">
            {receipt.items.map((item, index) => {
              const qty = parseFloat(item.quantity) || 0;
              const price = parseFloat(item.price) || 0;
              return (
                <View key={index} className="flex-row items-center p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
                  <Text className="flex-1 font-semibold" style={{ color: colors.foreground }}>{item.name}</Text>
                  <Text className="w-12 text-center text-sm" style={{ color: colors.muted }}>{item.quantity}</Text>
                  <Text className="w-20 text-right text-sm" style={{ color: colors.muted }}>{price > 0 ? `RM ${price.toFixed(2)}` : '-'}</Text>
                  <Text className="w-20 text-right text-sm font-bold" style={{ color: colors.primary }}>{qty * price > 0 ? `RM ${(qty * price).toFixed(2)}` : '-'}</Text>
                </View>
              );
            })}
          </View>
          <View className="flex-row justify-between items-center mt-4 pt-3 border-t" style={{ borderColor: colors.primary + '40' }}>
            <Text className="font-bold uppercase text-sm" style={{ color: colors.foreground }}>Grand Total</Text>
            <Text className="text-xl font-bold" style={{ color: colors.primary }}>{fmt(receipt.totalAmount || 0)}</Text>
          </View>
        </View>

        {/* Notes */}
        {!!receipt.notes && (
          <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: colors.muted }}>Notes</Text>
            <Text style={{ color: colors.foreground }}>{receipt.notes}</Text>
          </View>
        )}

        {/* Images */}
        {receipt.images.length > 0 && (
          <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>Photos ({receipt.images.length})</Text>
            <View className="flex-row flex-wrap gap-2">
              {receipt.images.map((uri, index) => (
                <Image key={index} source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
              ))}
            </View>
          </View>
        )}

        {/* Sync status */}
        {!receipt.synced && (
          <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.warning + '20' }}>
            <View className="flex-row items-center gap-2">
              <Text className="text-lg">📡</Text>
              <View className="flex-1">
                <Text className="text-xs font-bold uppercase" style={{ color: colors.warning }}>Pending Sync</Text>
                <Text className="text-xs mt-1" style={{ color: colors.warning }}>{isOnline ? 'Will sync shortly' : 'Will sync when online'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <TouchableOpacity onPress={handleDelete} className="w-full py-3 rounded-lg items-center justify-center mb-8" style={{ backgroundColor: colors.error + '20', borderColor: colors.error, borderWidth: 1 }}>
          <Text className="text-sm font-bold uppercase" style={{ color: colors.error }}>Delete Receipt</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
