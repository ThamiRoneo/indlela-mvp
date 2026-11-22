import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

type ModalButton = {
  label: string;
  onPress: () => void;
  style?: any;
  textStyle?: any;
  accessibilityLabel?: string;
  disabled?: boolean;
};

type ModalProps = {
  title: string;
  text: string;
  buttons: ModalButton[];
  children?: React.ReactNode;
  icon?: string;
  reverseButtons?: boolean;
};

export const Modal = ({ title, text, buttons, children, icon, reverseButtons = false }: ModalProps) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {icon && (
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{text}</Text>
        {children && <View style={styles.children}>{children}</View>}
        <View style={[styles.buttonContainer, reverseButtons && styles.buttonContainerReverse]}>
          {buttons.map((b, i) => (
            <TouchableOpacity
              key={i}
              onPress={b.disabled ? undefined : b.onPress}
              disabled={b.disabled}
              style={[styles.button, b.style, b.disabled && styles.buttonDisabled]}
              accessibilityRole="button"
              accessibilityLabel={b.accessibilityLabel || b.label}
            >
              <Text style={[styles.buttonText, b.textStyle]}>{b.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.space.lg,
    zIndex: 999,
  },
  modal: {
    width: '100%',
    maxWidth: 360,
    padding: tokens.space.xl,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fce8e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.space.md,
  },
  iconText: {
    fontSize: 24,
    color: tokens.color.error,
  },
  title: {
    fontSize: tokens.font.h2.size,
    fontWeight: '700',
    color: tokens.color.text,
    marginBottom: tokens.space.sm,
  },
  body: {
    fontSize: tokens.font.body.size,
    lineHeight: 20,
    color: tokens.color.textSecondary,
    marginBottom: tokens.space.lg,
  },
  children: {
    marginVertical: tokens.space.sm,
  },
  buttonContainer: {
    gap: tokens.space.sm,
  },
  buttonContainerReverse: {
    flexDirection: 'column-reverse',
  },
  button: {
    minWidth: tokens.size.touchMin,
    minHeight: tokens.size.touchMin,
    padding: 12,
    borderRadius: 8,
    backgroundColor: tokens.color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#bdc1c6',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: tokens.font.button.size,
    fontWeight: '500',
  },
});
