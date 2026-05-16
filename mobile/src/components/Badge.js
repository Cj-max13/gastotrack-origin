import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Badge = ({
  label,
  variant = 'primary',
  size = 'medium',
}) => {
  const variantStyles = {
    primary: styles.primaryBadge,
    success: styles.successBadge,
    warning: styles.warningBadge,
    danger: styles.dangerBadge,
  };

  const sizeStyles = {
    small: styles.smallBadge,
    medium: styles.mediumBadge,
    large: styles.largeBadge,
  };

  const sizeTextStyles = {
    small: styles.smallText,
    medium: styles.mediumText,
    large: styles.largeText,
  };

  return (
    <View style={[styles.badge, variantStyles[variant], sizeStyles[size]]}>
      <Text style={[styles.text, sizeTextStyles[size]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadge: {
    backgroundColor: '#E8F5E9',
  },
  successBadge: {
    backgroundColor: '#C8E6C9',
  },
  warningBadge: {
    backgroundColor: '#FFE0B2',
  },
  dangerBadge: {
    backgroundColor: '#FFCDD2',
  },
  smallBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mediumBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  largeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    fontWeight: '600',
    color: '#0D2B2B',
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
});
