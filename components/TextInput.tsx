import React from 'react';
import { TextInput as RNTextInput, StyleSheet } from 'react-native';

type TextInputProps = {
  value?: string;
  error?: string;
  secureTextEntry?: boolean;
  onChangeText?: (text: string) => void;
  onTogglePassword?: () => void;
  placeholder?: string;
};

export const TextInput = ({ value, error, secureTextEntry, onChangeText, onTogglePassword, placeholder }: TextInputProps) => {
  const [showPassword, setShowPassword] = React.useState(!secureTextEntry);
  return (
    <RNTextInput
      style={[styles.input, error && styles.error]}
      value={value || ''}
      onChangeText={onChangeText}
      secureTextEntry={showPassword ? false : secureTextEntry || false}
      placeholder={placeholder}
    />
  );
};

const styles = StyleSheet.create({
  input: { borderColor: '#dadce0', borderWidth: 1, borderRadius: 8, padding: 12 },
  error: { borderColor: '#ea4335' },
});
