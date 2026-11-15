import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type ToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export const Toggle = ({ value, onChange }: ToggleProps) => {
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      style={[styles.container, value && styles.active]}
    >
      <Text>{value ? 'On' : 'Off'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, borderRadius: 8 },
  active: { backgroundColor: '#34a853' },
});
