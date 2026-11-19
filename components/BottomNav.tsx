import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

type BottomNavProps = {
  activeTab: string;
  onTabPress: (tab: string) => void;
};

const TABS = ['Home', 'Fares', 'Alerts', 'Activity', 'Profile'];

export const BottomNav = ({ activeTab, onTabPress }: BottomNavProps) => {
  return (
    <View style={styles.nav}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onTabPress(tab)}
          style={[styles.tab, activeTab === tab && styles.active]}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === tab }}
          accessibilityLabel={tab}
        >
          <Text>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', padding: 8 },
  tab: { minWidth: tokens.size.touchMin, minHeight: tokens.size.touchMin, padding: 16, borderRadius: 8 },
  active: { backgroundColor: '#1a73e8' },
});
