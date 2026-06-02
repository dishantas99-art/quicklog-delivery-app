import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      {user?.role === "staff" ? (
        <Tabs.Screen
          name="index"
          options={{
            title: "Receipts",
            href: "/staff-home",
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="clipboard.fill" color={color} />,
          }}
        />
      ) : (
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            href: "/admin-dashboard",
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
      )}
    </Tabs>
  );
}
