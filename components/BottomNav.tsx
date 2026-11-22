import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Briefcase,
  Compass,
  Bell,
  Clock,
  User,
} from 'lucide-react-native';
import { tokens } from '../theme/tokens';

type BottomNavProps = {
  activeTab: string;
  onTabPress: (tab: string) => void;
};

const TAB_CONFIG = [
  { name: 'Home', icon: Briefcase },
  { name: 'Fares', icon: Compass },
  { name: 'Alerts', icon: Bell },
  { name: 'Activity', icon: Clock },
  { name: 'Profile', icon: User },
] as const;

export const BottomNav = ({ activeTab, onTabPress }: BottomNavProps) => {
  return (
    <View style={styles.nav}>
      {TAB_CONFIG.map(({ name, icon: IconComponent }) => {
        const isActive = activeTab === name;
        const iconColor = isActive ? '#1a73e8' : tokens.color.textSecondary;
        return (
          <TouchableOpacity
            key={name}
            onPress={() => onTabPress(name)}
            style={[styles.tab, isActive && styles.active]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={name}
          >
            <IconComponent size={20} color={iconColor} strokeWidth={isActive ? 2.5 : 2} />
            <Text style={[styles.tabText, isActive && styles.activeText]}>{name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e8eaed',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    minWidth: tokens.size.touchMin,
    minHeight: tokens.size.touchMin,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  active: {
    backgroundColor: '#e8f0fe',
  },
  tabText: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
    fontWeight: '500',
  },
  activeText: {
    color: '#1a73e8',
    fontWeight: '700',
  },
});
