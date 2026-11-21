import { Slot, useRouter, usePathname } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomNav } from '../../components/BottomNav';
import { tokens } from '../../theme/tokens';

const TABS = [
  { name: 'Home', href: '/(tabs)/index' },
  { name: 'Fares', href: '/(tabs)/fares' },
  { name: 'Alerts', href: '/(tabs)/alerts' },
  { name: 'Activity', href: '/(tabs)/activity' },
  { name: 'Profile', href: '/(tabs)/profile' },
];

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = TABS.find((t) => t.href === pathname)?.name || 'Home';
  return (
    <View style={styles.container}>
      <Slot />
      <BottomNav activeTab={activeTab} onTabPress={(tab) => router.replace(TABS.find((t) => t.name === tab)?.href || '/(tabs)/index')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
});
