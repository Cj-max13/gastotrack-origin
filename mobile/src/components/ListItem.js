import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const ListItem = ({
  title,
  subtitle,
  amount,
  icon,
  onPress,
  rightComponent,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      disabled={!onPress}
    >
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color="#0D2B2B" />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {amount && (
        <Text style={[styles.amount, amount < 0 ? styles.negative : styles.positive]}>
          ₱{Math.abs(amount).toFixed(2)}
        </Text>
      )}
      {rightComponent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D2B2B',
  },
  subtitle: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
  negative: {
    color: '#F44336',
  },
  positive: {
    color: '#4CAF50',
  },
});
