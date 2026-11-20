import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

type ToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  accessibilityLabel?: string;
};

export const Toggle = ({ value, onChange, accessibilityLabel }: ToggleProps) => {
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      style={[styles.container, value && styles.active]}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
    >
      <Text>{value ? 'On' : 'Off'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { minWidth: tokens.size.touchMin, minHeight: tokens.size.touchMin, padding: 16, borderRadius: 8 },
  active: { backgroundColor: '#34a853' },
});
