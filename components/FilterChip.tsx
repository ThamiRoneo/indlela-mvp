import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

type FilterChipProps = {
  selected: boolean;
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

export const FilterChip = ({ selected, label, onPress, accessibilityLabel }: FilterChipProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
    >
      <Text>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: { minWidth: tokens.size.touchMin, minHeight: tokens.size.touchMin, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  selected: { backgroundColor: '#1a73e8' },
});
