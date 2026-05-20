import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth, type UserRole } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 items-center justify-center px-6 py-12">
        {/* Logo Box */}
        <View
          className="w-20 h-20 rounded-3xl items-center justify-center mb-6 shadow-lg"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-4xl">📦</Text>
        </View>

        {/* Title */}
        <Text
          className="text-4xl font-bold text-center mb-1"
          style={{ color: colors.foreground }}
        >
          QUICKLOG
        </Text>
        <Text
          className="text-xs font-bold tracking-widest text-center mb-8 uppercase"
          style={{ color: colors.muted }}
        >
          Delivery Management
        </Text>

        {/* Error Message */}
        {error ? (
          <View className="w-full mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.error + '20' }}>
            <Text style={{ color: colors.error }} className="text-sm font-semibold">
              {error}
            </Text>
          </View>
        ) : null}

        {/* Email Input */}
        <View className="w-full mb-4">
          <Text
            className="text-xs font-bold tracking-wider mb-2 pl-1 uppercase"
            style={{ color: colors.muted }}
          >
            Email
          </Text>
          <TextInput
            className="w-full px-4 py-4 rounded-2xl text-base font-semibold tracking-wide uppercase"
            style={{
              backgroundColor: colors.surface,
              color: colors.foreground,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            placeholder="your@email.com"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password Input */}
        <View className="w-full mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-2 pl-1 uppercase"
            style={{ color: colors.muted }}
          >
            Password
          </Text>
          <TextInput
            className="w-full px-4 py-4 rounded-2xl text-base font-semibold tracking-wide uppercase"
            style={{
              backgroundColor: colors.surface,
              color: colors.foreground,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            placeholder="••••••••"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
            secureTextEntry
          />
        </View>

        {/* Role Selector */}
        <View className="w-full mb-6">
          <Text
            className="text-xs font-bold tracking-wider mb-3 pl-1 uppercase"
            style={{ color: colors.muted }}
          >
            Login As
          </Text>
          <View className="flex-row gap-3">
            {(['staff', 'admin'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r)}
                disabled={isLoading}
                className="flex-1 py-3 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: role === r ? colors.primary : colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                }}
              >
                <Text
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: role === r ? '#fff' : colors.foreground }}
                >
                  {r === 'staff' ? '👤 Staff' : '👨‍💼 Admin'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          className="w-full py-4 rounded-3xl items-center justify-center"
          style={{ backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-base font-bold uppercase tracking-widest text-white">
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        {/* Demo Hint */}
        <Text
          className="text-xs font-bold tracking-wider text-center mt-8 uppercase"
          style={{ color: colors.muted }}
        >
          Demo: Use any email and password
        </Text>
      </View>
    </ScrollView>
  );
}
