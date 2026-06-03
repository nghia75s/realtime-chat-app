import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ChatHeaderProps {
  name: string;
  avatar: string;
  isOnline?: boolean;
}

export default function ChatHeader({ name, avatar, isOnline = true }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <IconSymbol name="chevron.left" size={28} color="#8E8E93" />
      </TouchableOpacity>
      
      <View style={styles.headerInfo}>
        <Image 
          source={{ uri: avatar || 'https://via.placeholder.com/40' }} 
          style={styles.headerAvatar} 
        />
        <View>
          <Text style={styles.headerName}>{name || 'Đồng nghiệp'}</Text>
          <Text style={styles.headerStatus}>{isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}</Text>
        </View>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerActionBtn}>
          <IconSymbol name="phone.fill" size={22} color="#8E8E93" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerActionBtn}>
          <IconSymbol name="video.fill" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1c22',
    backgroundColor: '#070913',
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerStatus: {
    fontSize: 12,
    color: '#22c55e',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionBtn: {
    marginLeft: 16,
    padding: 6,
  },
});
