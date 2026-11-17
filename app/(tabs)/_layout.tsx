import { Slot } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomNav } from '../../components/BottomNav';
import { tokens } from '../../theme/tokens';
import { useRouter } from 'expo-router';

const TABS = [
  { name: 'Home', href: '/(tabs)/index' },
  { name: 'Fares', href: '/(tabs)/fares' },
  { name: 'Alerts', href: '/(tabs)/alerts' },
  { name: 'Activity', href: '/(tabs)/activity' },
  { name: 'Profile', href: '/(tabs)/profile' },
];

export default function TabsLayout() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Slot />
      <BottomNav activeTab="Home" onTabPress={(tab) => router.replace(TABS.find((t) => t.name === tab)?.href || '/(tabs)/index')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
});
