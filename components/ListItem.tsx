import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

type ListItemProps = {
  state?: 'default' | 'selected' | 'disabled';
  label: string;
  subtitle?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export const ListItem = ({ state = 'default', label, subtitle, onPress, accessibilityLabel }: ListItemProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={state === 'disabled'}
      style={[styles.item, styles[state]]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
    >
      <Text style={styles.label}>{label}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: { minWidth: tokens.size.touchMin, minHeight: tokens.size.touchMin, padding: 16, borderRadius: 8, borderBottomWidth: 1, borderBottomColor: '#dadce0' },
  default: { backgroundColor: 'transparent' },
  selected: { backgroundColor: '#1a73e8' },
  disabled: { opacity: 0.5 },
  label: { fontSize: tokens.font.body.size, color: tokens.color.text },
  subtitle: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginTop: tokens.space.xs },
});
