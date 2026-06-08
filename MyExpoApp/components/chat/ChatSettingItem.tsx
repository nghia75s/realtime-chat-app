import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatSettingItemProps {
  icon: any;
  title: string;
  type?: 'link' | 'switch' | 'color' | 'count' | 'action';
  value?: any;
  onToggle?: (val: boolean) => void;
  onPress?: () => void;
  color?: string;
  danger?: boolean;
}

export default function ChatSettingItem({ 
  icon, 
  title, 
  type = 'link', 
  value, 
  onToggle, 
  onPress, 
  color = '#333',
  danger = false
}: ChatSettingItemProps) {
  
  const textColor = danger ? '#FF3B30' : color;
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress} 
      disabled={type === 'switch' && !onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <Ionicons name={icon} size={22} color={textColor} style={styles.icon} />
        <Text style={[styles.title, { color: textColor, fontWeight: danger ? '500' : '600' }]}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContent}>
        {type === 'count' && (
          <View style={styles.countContainer}>
            <Text style={styles.countText}>{value}</Text>
            <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
          </View>
        )}

        {type === 'link' && (
          <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
        )}

        {type === 'switch' && (
          <View style={styles.switchContainer}>
            <Switch
              value={value}
              onValueChange={onToggle}
              trackColor={{ false: '#D1D1D6', true: '#00A3FF' }}
              thumbColor="#FFFFFF"
            />
            {/* Some switches might also have a right arrow if they open a sub-menu */}
            {onPress && (
              <Ionicons name="chevron-forward" size={20} color="#A0A0A0" style={{ marginLeft: 8 }} />
            )}
          </View>
        )}

        {type === 'color' && (
          <View style={[styles.colorBox, { backgroundColor: value || '#00A3FF' }]} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
    width: 24, // Fixed width for alignment
    textAlign: 'center',
  },
  title: {
    fontSize: 15,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginRight: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
});
