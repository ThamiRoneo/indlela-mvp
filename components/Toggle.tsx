import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

type ToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  accessibilityLabel?: string;
};

export const Toggle = ({ value, onChange, label, accessibilityLabel }: ToggleProps) => {
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      style={[styles.container, value && styles.active]}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ checked: value }}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      <Text>{value ? 'On' : 'Off'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: tokens.size.touchMin,
    minHeight: tokens.size.touchMin,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: { marginRight: tokens.space.sm },
  active: { backgroundColor: '#34a853' },
});
