import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type ListItemProps = {
  state?: 'default' | 'selected' | 'disabled';
  label: string;
  subtitle?: string;
  onPress?: () => void;
};

export const ListItem = ({ state = 'default', label, subtitle, onPress }: ListItemProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={state === 'disabled'}
      style={[styles.item, styles[state]]}
    >
      <Text style={styles.label}>{label}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: { padding: 16, borderRadius: 8, borderBottomWidth: 1, borderBottomColor: '#dadce0' },
  default: { backgroundColor: 'transparent' },
  selected: { backgroundColor: '#1a73e8' },
  disabled: { opacity: 0.5 },
  label: { fontSize: 14, color: '#202124' },
  subtitle: { fontSize: 12, color: '#5f6368', marginTop: 2 },
});
