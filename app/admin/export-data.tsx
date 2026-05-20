import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';

interface ExportHistory {
  id: string;
  date: string;
  format: 'csv' | 'pdf';
  recordCount: number;
}

export default function ExportDataScreen() {
  const colors = useColors();
  const router = useRouter();
  const [fromDate, setFromDate] = useState('2024-04-20');
  const [toDate, setToDate] = useState('2024-05-20');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [isLoading, setIsLoading] = useState(false);

  const [exportHistory] = useState<ExportHistory[]>([
    { id: '1', date: '2024-05-15', format: 'csv', recordCount: 45 },
    { id: '2', date: '2024-05-10', format: 'pdf', recordCount: 32 },
    { id: '3', date: '2024-05-01', format: 'csv', recordCount: 89 },
  ]);

  const handleExport = async () => {
    if (!fromDate || !toDate) {
      alert('Please select date range');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call backend API to generate export
      console.log('Exporting data:', { fromDate, toDate, format: exportFormat });
      alert(`Export generated successfully!\nFormat: ${exportFormat.toUpperCase()}\nRecords: 156`);
    } catch (error) {
      alert('Failed to generate export');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer containerClassName="flex-1" className="flex-1 p-0">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center gap-4" style={{ backgroundColor: colors.foreground }}>
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: colors.muted + '30' }}>
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold uppercase" style={{ color: '#fff' }}>
          Export Data
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Export Form */}
        <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
          <Text className="text-xs font-bold tracking-wider uppercase mb-4" style={{ color: colors.muted }}>
            Export Settings
          </Text>

          {/* Date Range */}
          <Text className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: colors.muted }}>
            From Date
          </Text>
          <TextInput
            className="w-full px-4 py-3 rounded-lg mb-4 font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: colors.background,
              color: colors.foreground,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            value={fromDate}
            onChangeText={setFromDate}
          />

          <Text className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: colors.muted }}>
            To Date
          </Text>
          <TextInput
            className="w-full px-4 py-3 rounded-lg mb-4 font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: colors.background,
              color: colors.foreground,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            value={toDate}
            onChangeText={setToDate}
          />

          {/* Format Selection */}
          <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>
            Export Format
          </Text>

          <View className="flex-row gap-3 mb-6">
            {(['csv', 'pdf'] as const).map((format) => (
              <TouchableOpacity
                key={format}
                onPress={() => setExportFormat(format)}
                className="flex-1 py-3 rounded-lg items-center justify-center"
                style={{
                  backgroundColor: exportFormat === format ? colors.primary : colors.background,
                  borderColor: colors.border,
                  borderWidth: 1,
                }}
              >
                <Text
                  className="text-sm font-bold uppercase"
                  style={{ color: exportFormat === format ? '#fff' : colors.foreground }}
                >
                  {format.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Export Button */}
          <TouchableOpacity
            onPress={handleExport}
            disabled={isLoading}
            className="w-full py-4 rounded-lg items-center justify-center"
            style={{ backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold uppercase text-white">Generate Export</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Export History */}
        <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>
          Recent Exports
        </Text>

        <View className="gap-2 pb-8">
          {exportHistory.map((item) => (
            <View key={item.id} className="p-4 rounded-2xl flex-row items-center justify-between" style={{ backgroundColor: colors.surface }}>
              <View className="flex-1">
                <Text className="font-bold uppercase" style={{ color: colors.foreground }}>
                  {item.format.toUpperCase()} Export
                </Text>
                <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                  {item.date} • {item.recordCount} records
                </Text>
              </View>
              <TouchableOpacity
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                <Text className="text-xs font-bold uppercase" style={{ color: colors.primary }}>
                  Download
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
