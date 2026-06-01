import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import { receiptStorage, type Receipt } from '@/lib/storage-service';

export default function AllReceiptsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    receiptStorage.getAllReceipts().then((all) => {
      setReceipts(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setIsLoading(false);
    });
  }, []);

  const filtered = receipts.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      (r.customerName.toLowerCase().includes(q) || r.location.toLowerCase().includes(q)) &&
      (filterStatus === 'all' || r.status === filterStatus)
    );
  });

  const fmt = (v: number) => `RM ${v.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const subtotal = filtered.reduce((s, r) => s + (r.totalAmount || 0), 0);

  return (
    <ScreenContainer containerClassName="flex-1" className="flex-1 p-0">
      <View className="px-6 py-4 flex-row items-center gap-4" style={{ backgroundColor: colors.foreground }}>
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: colors.muted + '30' }}>
          <Text className="text-xl text-white">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold uppercase" style={{ color: '#fff' }}>All Receipts</Text>
          <Text className="text-xs mt-1" style={{ color: colors.primary }}>{filtered.length} receipts · {fmt(subtotal)}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        <View className="mb-4 px-4 py-3 rounded-2xl flex-row items-center gap-2" style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="text-lg">🔍</Text>
          <TextInput className="flex-1 font-semibold" style={{ color: colors.foreground }} placeholder="Search customer or location..." placeholderTextColor={colors.muted} value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        <View className="flex-row gap-2 mb-4">
          {(['all', 'completed', 'pending'] as const).map((s) => (
            <TouchableOpacity key={s} onPress={() => setFilterStatus(s)} className="px-4 py-2 rounded-full" style={{ backgroundColor: filterStatus === s ? colors.primary : colors.surface, borderColor: colors.border, borderWidth: 1 }}>
              <Text className="text-xs font-bold uppercase" style={{ color: filterStatus === s ? '#fff' : colors.foreground }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading
          ? <View className="items-center py-12"><ActivityIndicator size="large" color={colors.primary} /></View>
          : filtered.length === 0
            ? <View className="items-center py-12"><Text style={{ color: colors.muted }}>No receipts found</Text></View>
            : <View className="gap-2 pb-8">
                {filtered.map((r) => (
                  <TouchableOpacity key={r.id} onPress={() => router.push(`/receipt-detail?id=${r.id}`)} className="p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <Text className="font-bold uppercase" style={{ color: colors.foreground }}>{r.customerName}</Text>
                        <Text className="text-xs mt-1" style={{ color: colors.muted }}>{r.location} · {r.date}</Text>
                        <Text className="text-xs mt-1" style={{ color: colors.muted }}>👤 Staff: {r.staffId}</Text>
                      </View>
                      <View className="items-end gap-1">
                        <Text className="font-bold text-sm" style={{ color: colors.primary }}>{fmt(r.totalAmount || 0)}</Text>
                        <View className="px-2 py-1 rounded-lg" style={{ backgroundColor: r.status === 'completed' ? colors.success + '20' : colors.warning + '20' }}>
                          <Text className="text-xs font-bold uppercase" style={{ color: r.status === 'completed' ? colors.success : colors.warning }}>{r.status}</Text>
                        </View>
                      </View>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs" style={{ color: colors.muted }}>{r.items.length} item{r.items.length !== 1 ? 's' : ''} · {r.images.length} photo{r.images.length !== 1 ? 's' : ''}</Text>
                      {!r.synced && <Text className="text-xs" style={{ color: colors.warning }}>⏳ Unsynced</Text>}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
        }
      </ScrollView>
    </ScreenContainer>
  );
}
