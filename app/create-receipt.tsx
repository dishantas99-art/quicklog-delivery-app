import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';

interface FormData {
  customerName: string;
  location: string;
  date: string;
  notes: string;
  items: Array<{ name: string; quantity: string }>;
  images: string[];
}

export default function CreateReceiptScreen() {
  const colors = useColors();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    items: [{ name: '', quantity: '' }],
    images: [],
  });

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: '' }],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleUpdateItem = (index: number, field: 'name' | 'quantity', value: string) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handlePickImage = async () => {
    // TODO: Implement image picker using expo-image-picker
    alert('Image picker feature coming soon!');
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    if (!formData.customerName || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call backend API to save receipt
      console.log('Receipt data:', formData);
      alert('Receipt created successfully!');
      router.back();
    } catch (error) {
      alert('Failed to create receipt');
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
          New Receipt
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Customer Info */}
        <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
          <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>
            Delivery Details
          </Text>

          <Text className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: colors.muted }}>
            Customer Name *
          </Text>
          <TextInput
            className="w-full px-4 py-3 rounded-lg mb-4 font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: colors.background,
              color: colors.foreground,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            placeholder="Enter customer name"
            placeholderTextColor={colors.muted}
            value={formData.customerName}
            onChangeText={(text) => setFormData({ ...formData, customerName: text })}
          />

          <Text className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: colors.muted }}>
            Location *
          </Text>
          <TextInput
            className="w-full px-4 py-3 rounded-lg mb-4 font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: colors.background,
              color: colors.foreground,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            placeholder="Enter delivery location"
            placeholderTextColor={colors.muted}
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
          />

          <Text className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: colors.muted }}>
            Date
          </Text>
          <TextInput
            className="w-full px-4 py-3 rounded-lg font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: colors.background,
              color: colors.foreground,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            value={formData.date}
            onChangeText={(text) => setFormData({ ...formData, date: text })}
          />
        </View>

        {/* Items */}
        <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.foreground }}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.primary }}>
              Items
            </Text>
            <TouchableOpacity
              onPress={handleAddItem}
              className="w-9 h-9 rounded-lg items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-lg text-white">+</Text>
            </TouchableOpacity>
          </View>

          {formData.items.map((item, index) => (
            <View key={index} className="mb-3 pb-3 border-b" style={{ borderColor: colors.muted + '30' }}>
              <View className="flex-row gap-2 mb-2">
                <TextInput
                  className="flex-1 px-3 py-2 rounded-lg font-semibold text-sm uppercase"
                  style={{
                    backgroundColor: colors.muted + '20',
                    color: '#fff',
                  }}
                  placeholder="Item name"
                  placeholderTextColor={colors.muted}
                  value={item.name}
                  onChangeText={(text) => handleUpdateItem(index, 'name', text)}
                />
                <TextInput
                  className="w-20 px-3 py-2 rounded-lg font-semibold text-sm uppercase"
                  style={{
                    backgroundColor: colors.muted + '20',
                    color: '#fff',
                  }}
                  placeholder="Qty"
                  placeholderTextColor={colors.muted}
                  value={item.quantity}
                  onChangeText={(text) => handleUpdateItem(index, 'quantity', text)}
                  keyboardType="numeric"
                />
                {formData.items.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(index)}
                    className="w-9 h-9 rounded-lg items-center justify-center"
                    style={{ backgroundColor: colors.error + '30' }}
                  >
                    <Text style={{ color: colors.error }}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Notes */}
        <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
          <Text className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: colors.muted }}>
            Notes
          </Text>
          <TextInput
            className="w-full px-4 py-3 rounded-lg font-semibold"
            style={{
              backgroundColor: colors.background,
              color: colors.foreground,
              borderColor: colors.border,
              borderWidth: 1,
              minHeight: 80,
            }}
            placeholder="Add any additional notes"
            placeholderTextColor={colors.muted}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
          />
        </View>

        {/* Images */}
        <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.muted }}>
              Photos ({formData.images.length})
            </Text>
            <TouchableOpacity
              onPress={handlePickImage}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-xs font-bold uppercase text-white">Add Photo</Text>
            </TouchableOpacity>
          </View>

          {formData.images.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {formData.images.map((image, index) => (
                <View key={index} className="relative">
                  <View className="w-20 h-20 rounded-lg items-center justify-center" style={{ backgroundColor: colors.primary + '20' }}>
                    <Text className="text-2xl">📷</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.error }}
                  >
                    <Text className="text-white font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl items-center justify-center mb-8"
          style={{ backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-bold uppercase tracking-wider text-white">
              Create Receipt
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
