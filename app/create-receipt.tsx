import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
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

// Lazy-load ImagePicker to avoid crashing in Expo Go without the native module
let ImagePickerModule: any = null;
const loadImagePicker = async () => {
  if (!ImagePickerModule) {
    try {
      ImagePickerModule = await import('expo-image-picker');
    } catch (err) {
      console.warn('expo-image-picker not available. Use a custom dev client or EAS build.');
      return null;
    }
  }
  return ImagePickerModule;
};

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

  const addItem = () =>
    setFormData({ ...formData, items: [...formData.items, { name: '', quantity: '', price: '' }] });

  const removeItem = (i: number) =>
    setFormData({ ...formData, items: formData.items.filter((_, idx) => idx !== i) });

  const updateItem = (i: number, field: keyof ReceiptItem, value: string) => {
    const items = [...formData.items];
    items[i] = { ...items[i], [field]: value };
    setFormData({ ...formData, items });
  };

  const pickFromGallery = async () => {
    if (formData.images.length >= 7) {
      Alert.alert('Image Limit', 'You can add up to 7 images per receipt.');
      return;
    }
    const picker = await loadImagePicker();
    if (!picker) {
      Alert.alert(
        'Image Picker Not Available',
        'Please use a custom dev client or EAS build to access the camera and photo library.\n\nRun: npx expo prebuild && npx expo run:android'
      );
      return;
    }
    const { status } = await picker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }
    const result = await picker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setFormData({ ...formData, images: [...formData.images, result.assets[0].uri] });
    }
  };

  const pickFromCamera = async () => {
    if (formData.images.length >= 7) {
      Alert.alert('Image Limit', 'You can add up to 7 images per receipt.');
      return;
    }
    const picker = await loadImagePicker();
    if (!picker) {
      Alert.alert(
        'Image Picker Not Available',
        'Please use a custom dev client or EAS build to access the camera and photo library.\n\nRun: npx expo prebuild && npx expo run:android'
      );
      return;
    }
    const { status } = await picker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access.');
      return;
    }
    const result = await picker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled && result.assets.length > 0) {
      setFormData({ ...formData, images: [...formData.images, result.assets[0].uri] });
    }
  };

  const removeImage = (i: number) =>
    setFormData({ ...formData, images: formData.images.filter((_, idx) => idx !== i) });

  const lineTotal = (item: ReceiptItem) =>
    ((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)).toFixed(2);

  const grandTotal = computeTotal(formData.items);

  const handleSubmit = async () => {
    if (!formData.customerName.trim() || !formData.location.trim()) {
      Alert.alert('Validation Error', 'Customer name and location are required.');
      return;
    }
    const validItems = formData.items.filter((item) => item.name.trim() && item.quantity.trim());
    if (validItems.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one item with a name and quantity.');
      return;
    }
    if (formData.images.length < 5) {
      Alert.alert('Validation Error', `Please add at least 5 images. Currently: ${formData.images.length}/5-7`);
      return;
    }
    if (formData.images.length > 7) {
      Alert.alert('Validation Error', 'Maximum 7 images allowed per receipt.');
      return;
    }
    setIsLoading(true);
    try {
      if (!user) throw new Error('Not authenticated');
      await createReceipt({
        staffId: user.id,
        customerName: formData.customerName.trim(),
        location: formData.location.trim(),
        date: formData.date,
        status: 'completed',
        items: validItems,
        totalAmount: computeTotal(validItems),
        notes: formData.notes,
        images: formData.images,
        synced: false,
      });
      Alert.alert(
        'Receipt Created',
        isOnline ? 'Saved successfully.' : 'Saved locally. Will sync when online.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create receipt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer containerClassName="flex-1" className="flex-1 p-0">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center gap-4" style={{ backgroundColor: colors.foreground }}>
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={isLoading}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: colors.muted + '30',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text className="text-base font-bold text-white">{'<'}</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold uppercase" style={{ color: '#fff' }}>New Receipt</Text>
          {!isOnline && <Text className="text-xs mt-0.5" style={{ color: colors.warning }}>Offline Mode</Text>}
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-6 py-4" keyboardShouldPersistTaps="handled">

          {/* ── Delivery Details ── */}
          <View className="mb-5 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold tracking-wider uppercase mb-4" style={{ color: colors.muted }}>
              Delivery Details
            </Text>

            {([
              { label: 'Customer Name *', key: 'customerName', placeholder: 'Enter customer name', kb: 'default' },
              { label: 'Location *',      key: 'location',     placeholder: 'Enter delivery location', kb: 'default' },
              { label: 'Date',            key: 'date',         placeholder: 'YYYY-MM-DD', kb: 'default' },
            ] as const).map(({ label, key, placeholder, kb }) => (
              <View key={key} className="mb-4">
                <Text className="text-xs font-bold tracking-wider uppercase mb-1" style={{ color: colors.muted }}>
                  {label}
                </Text>
                <TextInput
                  className="w-full px-4 py-3 rounded-xl font-semibold"
                  style={{ backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border, borderWidth: 1 }}
                  placeholder={placeholder}
                  placeholderTextColor={colors.muted}
                  value={(formData as any)[key]}
                  onChangeText={(t) => setFormData({ ...formData, [key]: t })}
                  editable={!isLoading}
                  keyboardType={kb as any}
                />
              </View>
            ))}
          </View>

          {/* ── Items ── */}
          <View className="mb-5 p-4 rounded-2xl" style={{ backgroundColor: colors.foreground }}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.primary }}>
                Items *
              </Text>
              <TouchableOpacity
                onPress={addItem}
                disabled={isLoading}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text className="text-xl font-bold text-white leading-none">+</Text>
              </TouchableOpacity>
            </View>

            {/* Column headers */}
            <View className="flex-row gap-2 mb-2">
              <Text className="flex-1 text-xs font-bold uppercase" style={{ color: colors.muted }}>Item</Text>
              <Text className="w-14 text-xs font-bold uppercase text-center" style={{ color: colors.muted }}>Qty</Text>
              <Text className="w-20 text-xs font-bold uppercase text-center" style={{ color: colors.muted }}>Price(RM)</Text>
              <Text className="w-20 text-xs font-bold uppercase text-right" style={{ color: colors.muted }}>Total</Text>
              <View style={{ width: 28 }} />
            </View>

            {formData.items.map((item, i) => (
              <View key={i} className="flex-row gap-2 items-center mb-3">
                <TextInput
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ backgroundColor: colors.muted + '20', color: '#fff' }}
                  placeholder="Item name"
                  placeholderTextColor={colors.muted}
                  value={item.name}
                  onChangeText={(t) => updateItem(i, 'name', t)}
                  editable={!isLoading}
                />
                <TextInput
                  className="w-14 px-2 py-2 rounded-lg text-sm font-semibold text-center"
                  style={{ backgroundColor: colors.muted + '20', color: '#fff' }}
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  value={item.quantity}
                  onChangeText={(t) => updateItem(i, 'quantity', t.replace(/[^0-9.]/g, ''))}
                  keyboardType="decimal-pad"
                  editable={!isLoading}
                />
                <TextInput
                  className="w-20 px-2 py-2 rounded-lg text-sm font-semibold text-center"
                  style={{ backgroundColor: colors.muted + '20', color: '#fff' }}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  value={item.price}
                  onChangeText={(t) => updateItem(i, 'price', t.replace(/[^0-9.]/g, ''))}
                  keyboardType="decimal-pad"
                  editable={!isLoading}
                />
                <Text className="w-20 text-xs font-bold text-right" style={{ color: colors.primary }}>
                  RM {lineTotal(item)}
                </Text>
                {formData.items.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeItem(i)}
                    disabled={isLoading}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      backgroundColor: colors.error + '30',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text className="font-bold text-sm" style={{ color: colors.error }}>x</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Grand Total */}
            <View className="flex-row justify-between items-center mt-2 pt-3 border-t" style={{ borderColor: colors.primary + '40' }}>
              <Text className="font-bold uppercase text-sm text-white">Grand Total</Text>
              <Text className="text-xl font-bold" style={{ color: colors.primary }}>
                RM {grandTotal.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* ── Notes ── */}
          <View className="mb-5 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: colors.muted }}>Notes</Text>
            <TextInput
              className="w-full px-4 py-3 rounded-xl font-semibold"
              style={{
                backgroundColor: colors.background, color: colors.foreground,
                borderColor: colors.border, borderWidth: 1,
                minHeight: 80, textAlignVertical: 'top',
              }}
              placeholder="Additional notes (optional)"
              placeholderTextColor={colors.muted}
              value={formData.notes}
              onChangeText={(t) => setFormData({ ...formData, notes: t })}
              multiline
              editable={!isLoading}
            />
          </View>

          {/* ── Photos ── */}
          <View className="mb-5 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.muted }}>
                Photos ({formData.images.length}/5-7)
              </Text>
              {formData.images.length < 5 && (
                <Text className="text-xs font-semibold" style={{ color: colors.warning }}>
                  {5 - formData.images.length} more required
                </Text>
              )}
              {formData.images.length >= 5 && (
                <Text className="text-xs font-semibold" style={{ color: colors.success }}>
                  ✓ Complete
                </Text>
              )}
            </View>
            <View className="flex-row gap-3 mb-3">
              <TouchableOpacity
                onPress={pickFromGallery}
                disabled={isLoading}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                <Text className="text-xs font-bold uppercase text-white">Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickFromCamera}
                disabled={isLoading}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                <Text className="text-xs font-bold uppercase text-white">Camera</Text>
              </TouchableOpacity>
            </View>

            {/* Image Grid */}
            {formData.images.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {formData.images.map((uri, i) => (
                  <View key={i} className="relative">
                    <Image
                      source={{ uri }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 8,
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => removeImage(i)}
                      disabled={isLoading}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: colors.error,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text className="text-xs font-bold text-white">x</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* ── Submit ── */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            style={{
              paddingVertical: 16,
              borderRadius: 12,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text className="text-sm font-bold uppercase tracking-wider text-white">Submit Receipt</Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
