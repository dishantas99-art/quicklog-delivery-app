import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import { receiptStorage, type Receipt } from '@/lib/storage-service';

interface ExportHistory {
  id: string;
  date: string;
  format: 'csv' | 'pdf';
  recordCount: number;
}

const asDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export default function ExportDataScreen() {
  const colors = useColors();
  const router = useRouter();
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [isLoading, setIsLoading] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([]);

  useEffect(() => {
    receiptStorage.getAllReceipts().then(setReceipts).catch(() => setReceipts([]));
  }, []);

  const filteredReceipts = useMemo(() => {
    const from = asDate(fromDate);
    const to = asDate(toDate);
    if (!from || !to) return [];
    const toDayEnd = new Date(to);
    toDayEnd.setHours(23, 59, 59, 999);
    return receipts.filter((receipt) => {
      const createdAt = asDate(receipt.createdAt);
      return createdAt && createdAt >= from && createdAt <= toDayEnd;
    });
  }, [receipts, fromDate, toDate]);

  const handleExport = async () => {
    const from = asDate(fromDate);
    const to = asDate(toDate);
    if (!from || !to) {
      Alert.alert('Invalid date', 'Please use YYYY-MM-DD format for both dates.');
      return;
    }
    if (from > to) {
      Alert.alert('Invalid date range', 'From date cannot be after To date.');
      return;
    }

    setIsLoading(true);
    try {
      const now = new Date();
      const recordCount = filteredReceipts.length;
      setExportHistory((prev) => [{
        id: `export_${now.getTime()}`,
        date: now.toISOString().split('T')[0],
        format: exportFormat,
        recordCount,
      }, ...prev].slice(0, 10));

      Alert.alert(
        'Export Generated',
        `Format: ${exportFormat.toUpperCase()}\nRecords: ${recordCount}\nRange: ${fromDate} to ${toDate}`,
      );
    } catch {
      Alert.alert('Failed', 'Failed to generate export. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer containerClassName="flex-1" className="flex-1 p-0">
      <View className="px-6 py-4 flex-row items-center gap-4" style={{ backgroundColor: colors.foreground }}>
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: colors.muted + '30' }}>
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold uppercase" style={{ color: '#fff' }}>Export Data</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
          <Text className="text-xs font-bold tracking-wider uppercase mb-4" style={{ color: colors.muted }}>Export Settings</Text>
          <Text className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: colors.muted }}>From Date</Text>
          <TextInput className="w-full px-4 py-3 rounded-lg mb-4 font-semibold uppercase tracking-wide" style={{ backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border, borderWidth: 1 }} placeholder="YYYY-MM-DD" placeholderTextColor={colors.muted} value={fromDate} onChangeText={setFromDate} />
          <Text className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: colors.muted }}>To Date</Text>
          <TextInput className="w-full px-4 py-3 rounded-lg mb-4 font-semibold uppercase tracking-wide" style={{ backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border, borderWidth: 1 }} placeholder="YYYY-MM-DD" placeholderTextColor={colors.muted} value={toDate} onChangeText={setToDate} />
          <Text className="text-xs mb-4" style={{ color: colors.muted }}>Matching receipts: {filteredReceipts.length}</Text>

          <View className="flex-row gap-3 mb-6">
            {(['csv', 'pdf'] as const).map((format) => (
              <TouchableOpacity key={format} onPress={() => setExportFormat(format)} className="flex-1 py-3 rounded-lg items-center justify-center" style={{ backgroundColor: exportFormat === format ? colors.primary : colors.background, borderColor: colors.border, borderWidth: 1 }}>
                <Text className="text-sm font-bold uppercase" style={{ color: exportFormat === format ? '#fff' : colors.foreground }}>{format.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={handleExport} disabled={isLoading} className="w-full py-4 rounded-lg items-center justify-center" style={{ backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-bold uppercase text-white">Generate Export</Text>}
          </TouchableOpacity>
        </View>

        <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>Recent Exports</Text>
        <View className="gap-2 pb-8">
          {exportHistory.length === 0 ? (
            <View className="p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
              <Text style={{ color: colors.muted }}>No exports yet.</Text>
            </View>
          ) : exportHistory.map((item) => (
            <View key={item.id} className="p-4 rounded-2xl flex-row items-center justify-between" style={{ backgroundColor: colors.surface }}>
              <View className="flex-1">
                <Text className="font-bold uppercase" style={{ color: colors.foreground }}>{item.format.toUpperCase()} Export</Text>
                <Text className="text-xs mt-1" style={{ color: colors.muted }}>{item.date} • {item.recordCount} records</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
