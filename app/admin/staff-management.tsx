import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STAFF_STORE_KEY } from '@/lib/auth-context';
import type { Receipt } from '@/lib/storage-service';

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  pin: string;
  role: 'staff' | 'admin';
  status: 'active' | 'inactive';
}

const DEFAULT_STAFF: StaffMember[] = [
  { id: 'staff_1', name: 'John Smith',    phone: '0111111111', pin: '1111', role: 'staff', status: 'active' },
  { id: 'staff_2', name: 'Sarah Johnson', phone: '0122222222', pin: '2222', role: 'staff', status: 'active' },
];

async function loadStaff(): Promise<StaffMember[]> {
  const raw = await AsyncStorage.getItem(STAFF_STORE_KEY);
  return raw ? JSON.parse(raw) : DEFAULT_STAFF;
}

async function saveStaff(list: StaffMember[]) {
  await AsyncStorage.setItem(STAFF_STORE_KEY, JSON.stringify(list));
}

export default function StaffManagementScreen() {
  const colors = useColors();
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [receiptCounts, setReceiptCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', phone: '', pin: '' });
  const [errors, setErrors] = useState({ name: '', phone: '', pin: '' });

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const members = await loadStaff();
      // Count receipts per staff from AsyncStorage
      const raw = await AsyncStorage.getItem('@quicklog_receipts');
      const receipts: Receipt[] = raw ? JSON.parse(raw) : [];
      const counts: Record<string, number> = {};
      for (const r of receipts) counts[r.staffId] = (counts[r.staffId] || 0) + 1;
      setReceiptCounts(counts);
      setStaff(members);
      setIsLoading(false);
    };
    init();
  }, []);

  const validate = () => {
    const errs = { name: '', phone: '', pin: '' };
    let valid = true;
    if (!newStaff.name.trim()) { errs.name = 'Name is required'; valid = false; }
    if (!newStaff.phone.trim()) { errs.phone = 'Phone is required'; valid = false; }
    else if (staff.some((s) => s.phone === newStaff.phone.trim())) { errs.phone = 'Phone already exists'; valid = false; }
    if (!newStaff.pin.trim()) { errs.pin = 'PIN is required'; valid = false; }
    else if (newStaff.pin.length !== 4 || !/^\d+$/.test(newStaff.pin)) { errs.pin = 'PIN must be exactly 4 digits'; valid = false; }
    setErrors(errs);
    return valid;
  };

  const handleAddStaff = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const member: StaffMember = {
        id: `staff_${Date.now()}`,
        name: newStaff.name.trim(),
        phone: newStaff.phone.trim(),
        pin: newStaff.pin.trim(),
        role: 'staff',
        status: 'active',
      };
      const updated = [...staff, member];
      await saveStaff(updated);
      setStaff(updated);
      setNewStaff({ name: '', phone: '', pin: '' });
      setErrors({ name: '', phone: '', pin: '' });
      setShowAddForm(false);
      Alert.alert(
        'Staff Added',
        `${member.name} can now log in.\n\nPhone: ${member.phone}\nPIN: ${member.pin}`,
      );
    } catch {
      Alert.alert('Error', 'Failed to add staff member');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const updated = staff.map((s) =>
      s.id === id ? { ...s, status: (s.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' } : s,
    );
    setStaff(updated);
    await saveStaff(updated);
  };

  const handleDelete = (id: string) => {
    const member = staff.find((s) => s.id === id);
    if (!member) return;
    Alert.alert(
      'Remove Staff',
      `Remove ${member.name}? Their receipts will remain.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            const updated = staff.filter((s) => s.id !== id);
            setStaff(updated);
            await saveStaff(updated);
          },
        },
      ],
    );
  };

  const Field = ({
    label, value, onChange, placeholder, keyboardType = 'default', secureTextEntry = false, error = '', maxLength,
  }: {
    label: string; value: string; onChange: (t: string) => void; placeholder: string;
    keyboardType?: any; secureTextEntry?: boolean; error?: string; maxLength?: number;
  }) => (
    <View className="mb-4">
      <Text className="text-xs font-bold tracking-wider uppercase mb-1" style={{ color: colors.muted }}>{label}</Text>
      <TextInput
        className="w-full px-4 py-3 rounded-xl font-semibold"
        style={{
          backgroundColor: colors.background,
          color: colors.foreground,
          borderColor: error ? colors.error : colors.border,
          borderWidth: 1,
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        editable={!isSaving}
      />
      {!!error && <Text className="text-xs mt-1" style={{ color: colors.error }}>{error}</Text>}
    </View>
  );

  const activeCount = staff.filter((s) => s.status === 'active').length;

  return (
    <ScreenContainer containerClassName="flex-1" className="flex-1 p-0">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between" style={{ backgroundColor: colors.foreground }}>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-lg items-center justify-center"
            style={{ backgroundColor: colors.muted + '30' }}
          >
            <Text className="text-base font-bold text-white">{'<'}</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold uppercase" style={{ color: '#fff' }}>Staff</Text>
            <Text className="text-xs mt-0.5" style={{ color: colors.primary }}>
              {activeCount} active · {staff.length} total
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => { setShowAddForm(!showAddForm); setErrors({ name: '', phone: '', pin: '' }); }}
          className="w-10 h-10 rounded-lg items-center justify-center"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-2xl font-bold text-white leading-none">{showAddForm ? 'x' : '+'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4" keyboardShouldPersistTaps="handled">

        {/* Add Staff Form */}
        {showAddForm && (
          <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold tracking-wider uppercase mb-4" style={{ color: colors.muted }}>
              New Staff Member
            </Text>

            <Field
              label="Full Name"
              placeholder="e.g. Ahmad Razif"
              value={newStaff.name}
              onChange={(t) => setNewStaff({ ...newStaff, name: t })}
              error={errors.name}
            />
            <Field
              label="Phone Number"
              placeholder="e.g. 0133334444"
              value={newStaff.phone}
              onChange={(t) => setNewStaff({ ...newStaff, phone: t.replace(/\D/g, '') })}
              keyboardType="phone-pad"
              error={errors.phone}
            />
            <Field
              label="PIN (4 digits)"
              placeholder="e.g. 5678"
              value={newStaff.pin}
              onChange={(t) => setNewStaff({ ...newStaff, pin: t.replace(/\D/g, '').slice(0, 4) })}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              error={errors.pin}
            />

            <TouchableOpacity
              onPress={handleAddStaff}
              disabled={isSaving}
              className="w-full py-3 rounded-xl items-center justify-center mt-2"
              style={{ backgroundColor: colors.primary, opacity: isSaving ? 0.7 : 1 }}
            >
              {isSaving
                ? <ActivityIndicator color="#fff" />
                : <Text className="text-sm font-bold uppercase tracking-wider text-white">Add Staff Member</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* List */}
        <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>
          All Staff ({staff.length})
        </Text>

        {isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : staff.length === 0 ? (
          <View className="items-center py-12">
            <Text style={{ color: colors.muted }}>No staff members yet. Tap + to add one.</Text>
          </View>
        ) : (
          <View className="gap-3 pb-10">
            {staff.map((member) => (
              <View key={member.id} className="p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
                {/* Top row */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="font-bold uppercase text-base" style={{ color: colors.foreground }}>
                      {member.name}
                    </Text>
                    <Text className="text-xs mt-1 font-semibold" style={{ color: colors.muted }}>
                      📞 {member.phone}
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
                      {receiptCounts[member.id] || 0} receipt{(receiptCounts[member.id] || 0) !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1 rounded-lg"
                    style={{ backgroundColor: member.status === 'active' ? colors.success + '20' : colors.error + '20' }}
                  >
                    <Text
                      className="text-xs font-bold uppercase"
                      style={{ color: member.status === 'active' ? colors.success : colors.error }}
                    >
                      {member.status}
                    </Text>
                  </View>
                </View>

                {/* Action row */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleToggleStatus(member.id)}
                    className="flex-1 py-2 rounded-lg items-center justify-center"
                    style={{ backgroundColor: colors.primary + '15', borderColor: colors.primary, borderWidth: 1 }}
                  >
                    <Text className="text-xs font-bold uppercase" style={{ color: colors.primary }}>
                      {member.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(member.id)}
                    className="px-4 py-2 rounded-lg items-center justify-center"
                    style={{ backgroundColor: colors.error + '15', borderColor: colors.error, borderWidth: 1 }}
                  >
                    <Text className="text-xs font-bold uppercase" style={{ color: colors.error }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
