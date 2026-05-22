import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const colors = useColors();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const pinRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    setError('');
    if (!phone.trim()) { setError('Please enter your phone number'); return; }
    if (pin.length < 4) { setError('PIN must be 4 digits'); return; }
    try {
      await login(phone, pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 items-center justify-center px-6 py-12">
          <View className="w-20 h-20 rounded-3xl items-center justify-center mb-6" style={{ backgroundColor: colors.primary }}>
            <Text className="text-4xl">📦</Text>
          </View>
          <Text className="text-4xl font-bold text-center mb-1" style={{ color: colors.foreground }}>QUICKLOG</Text>
          <Text className="text-xs font-bold tracking-widest text-center mb-8 uppercase" style={{ color: colors.muted }}>
            Delivery Management
          </Text>

          {error ? (
            <View className="w-full mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.error + '20' }}>
              <Text style={{ color: colors.error }} className="text-sm font-semibold">{error}</Text>
            </View>
          ) : null}

          <View className="w-full mb-4">
            <Text className="text-xs font-bold tracking-wider mb-2 pl-1 uppercase" style={{ color: colors.muted }}>Phone Number</Text>
            <TextInput
              className="w-full px-4 py-4 rounded-2xl text-base font-semibold"
              style={{ backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border, borderWidth: 1 }}
              placeholder="e.g. 0100000000"
              placeholderTextColor={colors.muted}
              value={phone}
              onChangeText={setPhone}
              editable={!isLoading}
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => pinRef.current?.focus()}
            />
          </View>

          <View className="w-full mb-8">
            <Text className="text-xs font-bold tracking-wider mb-2 pl-1 uppercase" style={{ color: colors.muted }}>PIN (4 digits)</Text>
            <TextInput
              ref={pinRef}
              className="w-full px-4 py-4 rounded-2xl text-base font-semibold tracking-widest"
              style={{ backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border, borderWidth: 1 }}
              placeholder="••••"
              placeholderTextColor={colors.muted}
              value={pin}
              onChangeText={(t) => setPin(t.replace(/\D/g, '').slice(0, 4))}
              editable={!isLoading}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={4}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="w-full py-4 rounded-3xl items-center justify-center"
            style={{ backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text className="text-base font-bold uppercase tracking-widest text-white">Sign In</Text>
            }
          </TouchableOpacity>

          <View className="mt-8 p-4 rounded-2xl w-full" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: colors.muted }}>Demo Credentials</Text>
            <Text className="text-xs mb-1" style={{ color: colors.muted }}>Admin: 0100000000 / PIN: 1234</Text>
            <Text className="text-xs mb-1" style={{ color: colors.muted }}>Staff 1: 0111111111 / PIN: 1111</Text>
            <Text className="text-xs" style={{ color: colors.muted }}>Staff 2: 0122222222 / PIN: 2222</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
