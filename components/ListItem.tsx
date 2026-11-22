import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

type ListItemProps = {
  state?: 'default' | 'selected' | 'disabled';
  label: string;
  subtitle?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export const ListItem = ({ state = 'default', label, subtitle, onPress, accessibilityLabel }: ListItemProps) => {
  const isSelected = state === 'selected';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={state === 'disabled'}
      style={[styles.item, styles[state]]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
    >
      <View style={[styles.radio, isSelected && styles.radioSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    minWidth: tokens.size.touchMin,
    minHeight: tokens.size.touchMin,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dadce0',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  default: { backgroundColor: '#ffffff', borderColor: '#dadce0' },
  selected: { backgroundColor: '#e8f0fe', borderColor: '#1a73e8' },
  disabled: { opacity: 0.5 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#5f6368',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: '#1a73e8',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1a73e8',
  },
  textContainer: { flex: 1 },
  label: { fontSize: tokens.font.body.size, fontWeight: '500', color: tokens.color.text },
  subtitle: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginTop: tokens.space.xs },
});
