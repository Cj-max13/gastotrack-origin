import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export const Button = ({
  onPress,
  label,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) => {
  const variantStyles = {
    primary: styles.primaryBtn,
    secondary: styles.secondaryBtn,
    danger: styles.dangerBtn,
    ghost: styles.ghostBtn,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        variantStyles[variant],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? '#0D2B2B' : '#FFF'} />
      ) : (
        <Text style={[styles.buttonText, variant === 'ghost' && styles.ghostText]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: '#0D2B2B',
  },
  secondaryBtn: {
    backgroundColor: '#2196F3',
  },
  dangerBtn: {
    backgroundColor: '#F44336',
  },
  ghostBtn: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#0D2B2B',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  ghostText: {
    color: '#0D2B2B',
  },
  disabled: {
    opacity: 0.5,
  },
});
