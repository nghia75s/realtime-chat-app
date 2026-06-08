import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };

  const renderInfoRow = (label: string, value: string) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label} :</Text>
      <View style={styles.infoValueContainer}>
        <Text style={styles.infoValue}>{value}</Text>
        <TouchableOpacity onPress={() => copyToClipboard(value)} style={styles.copyBtn}>
          <Ionicons name="copy-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header Background */}
        <View style={[styles.headerBackground, { paddingTop: Math.max(insets.top, 20) }]}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <Ionicons name="chatbubbles" size={26} color="#FFF" />
              <Text style={styles.logoText}>E-Chat</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerBtn}>
                <Ionicons name="search-outline" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn}>
                <Ionicons name="add" size={28} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Profile Avatar & Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.profilePicture || 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="pencil" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.fullname || 'Unknown User'}</Text>
        </View>

        {/* User Details */}
        <View style={styles.detailsSection}>
          {renderInfoRow('Điện thoại', user?.phoneNumber || 'Chưa cập nhật')}
          {renderInfoRow('Giới tính', user?.gender || 'Chưa cập nhật')}
          {renderInfoRow('Ngày sinh', user?.dateOfBirth || 'Chưa cập nhật')}
          {renderInfoRow('Email', user?.email || 'email@example.com')}
          {renderInfoRow('Phòng ban', user?.department || 'Chưa cập nhật')}
          {renderInfoRow('Chức vụ', user?.role || 'Chưa cập nhật')}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {/* Edit Profile removed as requested */}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#EF4444" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerBackground: {
    backgroundColor: '#1B64B3', // Dark Blue
    height: 160,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    marginLeft: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -60,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#F0F0F0',
  },
  editAvatarBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#38BDF8', // Light Blue
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  detailsSection: {
    paddingHorizontal: 30,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoLabel: {
    width: 90,
    fontSize: 16,
    color: '#7B8794', // Muted text color
    fontWeight: '500',
  },
  infoValueContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  copyBtn: {
    padding: 4,
  },
  actionSection: {
    paddingHorizontal: 30,
    marginTop: 20,
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2', // Light Red Background
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#EF4444', // Red Text
    fontSize: 16,
    fontWeight: 'bold',
  },
});
