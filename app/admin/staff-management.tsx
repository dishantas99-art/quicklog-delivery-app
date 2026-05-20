import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';

interface Staff {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  receiptCount: number;
}

export default function StaffManagementScreen() {
  const colors = useColors();
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([
    { id: '1', name: 'Alice Smith', email: 'alice@example.com', status: 'active', receiptCount: 45 },
    { id: '2', name: 'Bob Johnson', email: 'bob@example.com', status: 'active', receiptCount: 32 },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', status: 'inactive', receiptCount: 18 },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.email || !newStaff.password) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call backend API to add staff
      const addedStaff: Staff = {
        id: String(staff.length + 1),
        name: newStaff.name,
        email: newStaff.email,
        status: 'active',
        receiptCount: 0,
      };
      setStaff([...staff, addedStaff]);
      setNewStaff({ name: '', email: '', password: '' });
      setShowAddForm(false);
      alert('Staff member added successfully!');
    } catch (error) {
      alert('Failed to add staff');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = (id: string) => {
    setStaff(
      staff.map((s) =>
        s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s,
      ),
    );
  };

  return (
    <ScreenContainer containerClassName="flex-1" className="flex-1 p-0">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between" style={{ backgroundColor: colors.foreground }}>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: colors.muted + '30' }}>
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold uppercase" style={{ color: '#fff' }}>
            Staff Management
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAddForm(!showAddForm)}
          className="w-10 h-10 rounded-lg items-center justify-center"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-lg text-white">{showAddForm ? '×' : '+'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Add Staff Form */}
        {showAddForm && (
          <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>
              Add New Staff
            </Text>

            <TextInput
              className="w-full px-4 py-3 rounded-lg mb-3 font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: colors.background,
                color: colors.foreground,
                borderColor: colors.border,
                borderWidth: 1,
              }}
              placeholder="Full Name"
              placeholderTextColor={colors.muted}
              value={newStaff.name}
              onChangeText={(text) => setNewStaff({ ...newStaff, name: text })}
            />

            <TextInput
              className="w-full px-4 py-3 rounded-lg mb-3 font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: colors.background,
                color: colors.foreground,
                borderColor: colors.border,
                borderWidth: 1,
              }}
              placeholder="Email"
              placeholderTextColor={colors.muted}
              value={newStaff.email}
              onChangeText={(text) => setNewStaff({ ...newStaff, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              className="w-full px-4 py-3 rounded-lg mb-4 font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: colors.background,
                color: colors.foreground,
                borderColor: colors.border,
                borderWidth: 1,
              }}
              placeholder="Password"
              placeholderTextColor={colors.muted}
              value={newStaff.password}
              onChangeText={(text) => setNewStaff({ ...newStaff, password: text })}
              secureTextEntry
            />

            <TouchableOpacity
              onPress={handleAddStaff}
              disabled={isLoading}
              className="w-full py-3 rounded-lg items-center justify-center"
              style={{ backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-sm font-bold uppercase text-white">Add Staff</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Staff List */}
        <Text className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: colors.muted }}>
          All Staff ({staff.length})
        </Text>

        <View className="gap-2 pb-8">
          {staff.map((member) => (
            <View key={member.id} className="p-4 rounded-2xl" style={{ backgroundColor: colors.surface }}>
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <Text className="font-bold uppercase" style={{ color: colors.foreground }}>
                    {member.name}
                  </Text>
                  <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                    {member.email}
                  </Text>
                </View>
                <View
                  className="px-3 py-1 rounded-lg"
                  style={{
                    backgroundColor: member.status === 'active' ? colors.success + '20' : colors.error + '20',
                  }}
                >
                  <Text
                    className="text-xs font-bold uppercase"
                    style={{
                      color: member.status === 'active' ? colors.success : colors.error,
                    }}
                  >
                    {member.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-xs" style={{ color: colors.muted }}>
                  {member.receiptCount} receipts
                </Text>
                <TouchableOpacity
                  onPress={() => handleToggleStatus(member.id)}
                  className="px-3 py-1 rounded-lg"
                  style={{ backgroundColor: colors.primary + '20' }}
                >
                  <Text className="text-xs font-bold uppercase" style={{ color: colors.primary }}>
                    {member.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
