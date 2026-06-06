import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SettingsScreen() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await SecureStore.deleteItemAsync('userToken');
          setUser(null);
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: user?.profilePicture || 'https://via.placeholder.com/100' }}
          style={styles.avatar}
        />
        <Text style={styles.fullname}>{user?.fullname || 'Người dùng'}</Text>
        <Text style={styles.email}>{user?.email || 'Chưa cập nhật email'}</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <IconSymbol name="bell.fill" size={24} color="#8E8E93" />
          <Text style={styles.menuText}>Thông báo</Text>
          <IconSymbol name="chevron.right" size={20} color="#3a3c42" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <IconSymbol name="lock.fill" size={24} color="#8E8E93" />
          <Text style={styles.menuText}>Quyền riêng tư</Text>
          <IconSymbol name="chevron.right" size={20} color="#3a3c42" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070913',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1c22',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1c22',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  fullname: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#8E8E93',
  },
  menuSection: {
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1c22',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#e4e6eb',
    marginLeft: 16,
  },
  logoutItem: {
    marginTop: 20,
    borderBottomWidth: 0,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 16,
    fontWeight: 'bold',
  },
});
