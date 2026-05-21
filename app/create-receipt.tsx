import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/lib/auth-context';
import { useReceipts } from '@/lib/receipt-context';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import { computeTotal, type ReceiptItem } from '@/lib/storage-service';

interface FormData {
  customerName: string;
  location: string;
  date: string;
  notes: string;
  items: ReceiptItem[];
  images: string[];
}

export default function CreateReceiptScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const { createReceipt, isOnline } = useReceipts();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    items: [{ name: '', quantity: '', price: '' }],
    images: [],
  });

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, { name: '', quantity: '', price: '' }] });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const handleUpdateItem = (index: number, field: keyof ReceiptItem, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to add images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setFormData({ ...formData, images: [...formData.images, result.assets[0].uri] });
    }
  };

  const handleCameraImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setFormData({ ...formData, images: [...formData.images, result.assets[0].uri] });
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const lineTotal = (item: ReceiptItem) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return (qty * price).toFixed(2);
  };

  const grandTotal = computeTotal(formData.items);

  const handleSubmit = async () => {
    if (!formData.customerName || !formData.location) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }
    const validItems = formData.items.filter(
      (item) => item.name.trim() && item.quantity.trim()
    );
    if (validItems.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one item with name and quantity');
      return;
    }
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');
      await createReceipt({
        staffId: user.id,
        customerName: formData.customerName,
        location: formData.location,
        date: formData.date,
        status: 'completed',
        items: validItems,
        totalAmount: computeTotal(validItems),
        notes: formData.notes,
        images: formData.images,
        synced: false,
      });
      const message = isOnline
        ? 'Receipt created and saved!'
        : 'Receipt saved locally. Will sync when online.';
      Alert.alert('Success', message, [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create receipt');
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
        <View className="flex-1">
          <Text className="text-xl font-bold uppercase" style={{ color: '#fff' }}>New Receipt</Text>
          {!isOnline && (
            <Text className="text-xs mt-1" style={{ color: colors.warning }}>📡 Offline Mode</Text>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Delivery Details */}
        <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
          <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>
            Delivery Details
          </Text>

          {[
            { label: 'Customer Name *', key: 'customerName', placeholder: 'Enter customer name', keyboard: 'default' as const },
            { label: 'Location *', key: 'location', placeholder: 'Enter delivery location', keyboard: 'default' as const },
            { label: 'Date', key: 'date', placeholder: 'YYYY-MM-DD', keyboard: 'default' as const },
          ].map(({ label, key, placeholder, keyboard }) => (
            <View key={key} className="mb-4">
              <Text className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: colors.muted }}>{label}</Text>
              <TextInput
                className="w-full px-4 py-3 rounded-lg font-semibold"
                style={{ backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border, borderWidth: 1 }}
                placeholder={placeholder}
                placeholderTextColor={colors.muted}
                value={(formData as any)[key]}
                onChangeText={(text) => setFormData({ ...formData, [key]: text })}
                editable={!isLoading}
                keyboardType={keyboard}
              />
            </View>
          ))}
        </View>

        {/* Items */}
        <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.foreground }}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.primary }}>
              Items *
            </Text>
            <TouchableOpacity
              onPress={handleAddItem}
              disabled={isLoading}
              className="w-9 h-9 rounded-lg items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-lg text-white font-bold">+</Text>
            </TouchableOpacity>
          </View>

          {/* Column headers */}
          <View className="flex-row gap-2 mb-2">
            <Text className="flex-1 text-xs font-bold uppercase" style={{ color: colors.muted }}>Item</Text>
            <Text className="w-14 text-xs font-bold uppercase text-center" style={{ color: colors.muted }}>Qty</Text>
            <Text className="w-20 text-xs font-bold uppercase text-center" style={{ color: colors.muted }}>Price (RM)</Text>
            <Text className="w-20 text-xs font-bold uppercase text-right" style={{ color: colors.muted }}>Total</Text>
            <View style={{ width: 32 }} />
          </View>

          {formData.items.map((item, index) => (
            <View key={index} className="mb-3 pb-3 border-b" style={{ borderColor: colors.muted + '30' }}>
              <View className="flex-row gap-2 items-center">
                <TextInput
                  className="flex-1 px-3 py-2 rounded-lg font-semibold text-sm"
                  style={{ backgroundColor: colors.muted + '20', color: '#fff' }}
                  placeholder="Item name"
                  placeholderTextColor={colors.muted}
                  value={item.name}
                  onChangeText={(t) => handleUpdateItem(index, 'name', t)}
                  editable={!isLoading}
                />
                <TextInput
                  className="w-14 px-2 py-2 rounded-lg font-semibold text-sm text-center"
                  style={{ backgroundColor: colors.muted + '20', color: '#fff' }}
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  value={item.quantity}
                  onChangeText={(t) => handleUpdateItem(index, 'quantity', t.replace(/[^0-9.]/g, ''))}
                  keyboardType="decimal-pad"
                  editable={!isLoading}
                />
                <TextInput
                  className="w-20 px-2 py-2 rounded-lg font-semibold text-sm text-center"
                  style={{ backgroundColor: colors.muted + '20', color: '#fff' }}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  value={item.price}
                  onChangeText={(t) => handleUpdateItem(index, 'price', t.replace(/[^0-9.]/g, ''))}
                  keyboardType="decimal-pad"
                  editable={!isLoading}
                />
                <Text className="w-20 text-xs font-bold text-right" style={{ color: colors.primary }}>
                  RM {lineTotal(item)}
                </Text>
                {formData.items.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(index)}
                    disabled={isLoading}
                    className="w-8 h-8 rounded-lg items-center justify-center"
                    style={{ backgroundColor: colors.error + '30' }}
                  >
                    <Text style={{ color: colors.error }} className="font-bold">×</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {/* Grand Total */}
          <View className="flex-row justify-between items-center mt-3 pt-3 border-t" style={{ borderColor: colors.primary + '50' }}>
            <Text className="font-bold uppercase text-sm" style={{ color: '#fff' }}>Grand Total</Text>
            <Text className="text-xl font-bold" style={{ color: colors.primary }}>
              RM {grandTotal.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
          <Text className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: colors.muted }}>Notes</Text>
          <TextInput
            className="w-full px-4 py-3 rounded-lg font-semibold"
            style={{ backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border, borderWidth: 1, minHeight: 80 }}
            placeholder="Add any additional notes"
            placeholderTextColor={colors.muted}
            value={formData.notes}
            onChangeText={(t) => setFormData({ ...formData, notes: t })}
            multiline
            editable={!isLoading}
          />
        </View>

        {/* Images */}
        <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
          <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>
            Photos ({formData.images.length})
          </Text>
          <View className="flex-row gap-3 mb-3">
            <TouchableOpacity
              onPress={handlePickImage}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-xs font-bold uppercase text-white">🖼 Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCameraImage}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-xs font-bold uppercase text-white">📷 Camera</Text>
            </TouchableOpacity>
          </View>

          {formData.images.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {formData.images.map((uri, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri }}
                    className="w-20 h-20 rounded-lg"
                    style={{ width: 80, height: 80, borderRadius: 8 }}
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(index)}
                    disabled={isLoading}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.error }}
                  >
                    <Text className="text-white font-bold text-xs">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Submit */}
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
              {isOnline ? 'Create Receipt' : 'Save Offline'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
