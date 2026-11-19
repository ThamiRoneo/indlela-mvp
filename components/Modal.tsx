import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

type ModalButton = { label: string; onPress: () => void; style?: any; accessibilityLabel?: string };

type ModalProps = {
  title: string;
  text: string;
  buttons: ModalButton[];
  children?: React.ReactNode;
};

export const Modal = ({ title, text, buttons, children }: ModalProps) => {
  return (
    <View style={styles.modal}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{text}</Text>
      {children && <View style={styles.children}>{children}</View>}
      {buttons.map((b, i) => (
        <TouchableOpacity key={i} onPress={b.onPress} style={[styles.button, b.style]} accessibilityLabel={b.accessibilityLabel || b.label}>
          <Text>{b.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  modal: { padding: 32, backgroundColor: '#f8f9fa', borderRadius: 8 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  body: { fontSize: 14, marginBottom: 20 },
  button: { minWidth: tokens.size.touchMin, minHeight: tokens.size.touchMin, padding: 12, borderRadius: 8, backgroundColor: '#1a73e8' },
  children: { marginVertical: 12 },
});
