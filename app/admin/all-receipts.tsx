import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';

interface Receipt {
  id: string;
  customer: string;
  staff: string;
  date: string;
  status: 'completed' | 'pending';
  itemCount: number;
}

export default function AllReceiptsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

  const [receipts] = useState<Receipt[]>([
    { id: '1', customer: 'John Doe', staff: 'Alice Smith', date: '2024-05-20', status: 'completed', itemCount: 3 },
    { id: '2', customer: 'Jane Smith', staff: 'Bob Johnson', date: '2024-05-19', status: 'completed', itemCount: 2 },
    { id: '3', customer: 'Mike Wilson', staff: 'Alice Smith', date: '2024-05-18', status: 'pending', itemCount: 5 },
    { id: '4', customer: 'Sarah Davis', staff: 'Charlie Brown', date: '2024-05-17', status: 'completed', itemCount: 1 },
  ]);

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      receipt.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.staff.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.id.includes(searchQuery);

    const matchesStatus = filterStatus === 'all' || receipt.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <ScreenContainer containerClassName="flex-1" className="flex-1 p-0">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center gap-4" style={{ backgroundColor: colors.foreground }}>
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: colors.muted + '30' }}>
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold uppercase" style={{ color: '#fff' }}>
          All Receipts
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Search */}
        <View className="mb-4 px-4 py-3 rounded-2xl flex-row items-center gap-2" style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="text-lg">🔍</Text>
          <TextInput
            className="flex-1 font-semibold uppercase tracking-wide"
            style={{ color: colors.foreground }}
            placeholder="Search customer, staff, ID..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Buttons */}
        <View className="flex-row gap-2 mb-4">
          {(['all', 'completed', 'pending'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setFilterStatus(status)}
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor: filterStatus === status ? colors.primary : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
              }}
            >
              <Text
                className="text-xs font-bold uppercase"
                style={{ color: filterStatus === status ? '#fff' : colors.foreground }}
              >
                {status === 'all' ? 'All' : status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Receipts List */}
        <View className="gap-2 pb-8">
          {filteredReceipts.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-base" style={{ color: colors.muted }}>
                No receipts found
              </Text>
            </View>
          ) : (
            filteredReceipts.map((receipt) => (
              <TouchableOpacity
                key={receipt.id}
                onPress={() => router.push(`/receipt-detail?id=${receipt.id}`)}
                className="p-4 rounded-2xl"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="font-bold uppercase" style={{ color: colors.foreground }}>
                      {receipt.customer}
                    </Text>
                    <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                      ID: {receipt.id}
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
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-xs" style={{ color: colors.muted }}>
                    👤 {receipt.staff}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.muted }}>
                    {receipt.date} • {receipt.itemCount} items
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
