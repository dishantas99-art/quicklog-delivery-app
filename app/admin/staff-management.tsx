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

async function loadStaff(): Promise<StaffMember[]> {
  const raw = await AsyncStorage.getItem(STAFF_STORE_KEY);
  return raw ? JSON.parse(raw) : [];
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
  const [editingId, setEditingId] = useState<string | null>(null);
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
    else if (staff.some((s) => s.phone === newStaff.phone.trim() && s.id !== editingId)) { errs.phone = 'Phone already exists'; valid = false; }
    if (!newStaff.pin.trim()) { errs.pin = 'PIN is required'; valid = false; }
    else if (newStaff.pin.length !== 4 || !/^\d+$/.test(newStaff.pin)) { errs.pin = 'PIN must be exactly 4 digits'; valid = false; }
    setErrors(errs);
    return valid;
  };

  const handleAddStaff = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      if (editingId) {
        // Update existing staff
        const updated = staff.map((s) =>
          s.id === editingId
            ? {
              ...s,
              name: newStaff.name.trim(),
              phone: newStaff.phone.trim(),
              pin: newStaff.pin.trim(),
            }
            : s,
        );
        await saveStaff(updated);
        setStaff(updated);
        Alert.alert('Staff Updated', `${newStaff.name} has been updated.`);
        setEditingId(null);
      } else {
        // Add new staff
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
        Alert.alert(
          'Staff Added',
          `${member.name} can now log in.\n\nPhone: ${member.phone}\nPIN: ${member.pin}`,
        );
      }
      setNewStaff({ name: '', phone: '', pin: '' });
      setErrors({ name: '', phone: '', pin: '' });
      setShowAddForm(false);
    } catch {
      Alert.alert('Error', editingId ? 'Failed to update staff member' : 'Failed to add staff member');
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

  const handleEdit = (member: StaffMember) => {
    setEditingId(member.id);
    setNewStaff({ name: member.name, phone: member.phone, pin: member.pin });
    setShowAddForm(true);
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
            disabled={isSaving}
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
          <View>
            <Text className="text-xl font-bold uppercase" style={{ color: '#fff' }}>Staff</Text>
            <Text className="text-xs mt-0.5" style={{ color: colors.primary }}>
              {activeCount} active · {staff.length} total
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => { setShowAddForm(!showAddForm); setErrors({ name: '', phone: '', pin: '' }); }}
          disabled={isSaving}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text className="text-2xl font-bold text-white leading-none">{showAddForm ? 'x' : '+'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4" keyboardShouldPersistTaps="handled">

        {/* Add/Edit Staff Form */}
        {showAddForm && (
          <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold tracking-wider uppercase mb-4" style={{ color: colors.muted }}>
              {editingId ? 'Edit Staff Member' : 'New Staff Member'}
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

            <View className="flex-row gap-2 mt-2">
              <TouchableOpacity
                onPress={handleAddStaff}
                disabled={isSaving}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving
                  ? <ActivityIndicator color="#fff" />
                  : <Text className="text-sm font-bold uppercase tracking-wider text-white">
                    {editingId ? 'Update' : 'Add'}
                  </Text>
                }
              </TouchableOpacity>
              {editingId && (
                <TouchableOpacity
                  onPress={() => {
                    setEditingId(null);
                    setNewStaff({ name: '', phone: '', pin: '' });
                    setErrors({ name: '', phone: '', pin: '' });
                    setShowAddForm(false);
                  }}
                  disabled={isSaving}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: colors.muted + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  <Text className="text-sm font-bold uppercase tracking-wider" style={{ color: colors.muted }}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
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
                    onPress={() => handleEdit(member)}
                    disabled={isSaving}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: colors.primary + '15',
                      borderColor: colors.primary,
                      borderWidth: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isSaving ? 0.5 : 1,
                    }}
                  >
                    <Text className="text-xs font-bold uppercase" style={{ color: colors.primary }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleToggleStatus(member.id)}
                    disabled={isSaving}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: colors.warning + '15',
                      borderColor: colors.warning,
                      borderWidth: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isSaving ? 0.5 : 1,
                    }}
                  >
                    <Text className="text-xs font-bold uppercase" style={{ color: colors.warning }}>
                      {member.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(member.id)}
                    disabled={isSaving}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: colors.error + '15',
                      borderColor: colors.error,
                      borderWidth: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isSaving ? 0.5 : 1,
                    }}
                  >
                    <Text className="text-xs font-bold uppercase" style={{ color: colors.error }}>Delete</Text>
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
