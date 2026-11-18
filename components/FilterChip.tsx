import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type FilterChipProps = {
  selected: boolean;
  label: string;
  onPress: () => void;
};

export const FilterChip = ({ selected, label, onPress }: FilterChipProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  selected: { backgroundColor: '#1a73e8' },
});
