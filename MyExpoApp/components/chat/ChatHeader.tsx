import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface ChatHeaderProps {
  name: string;
  avatar: string;
  phone?: string;
}

export default function ChatHeader({ name, avatar, phone }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      
      <Image 
        source={{ uri: avatar || 'https://via.placeholder.com/40' }} 
        style={styles.avatar} 
      />
      
      <View style={styles.profileInfo}>
        <Text style={styles.nameText} numberOfLines={1}>{name || 'Người dùng'}</Text>
        <Text style={styles.phoneText}>{phone || '(+84) 99 9999 9999'}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="videocam-outline" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="call-outline" size={22} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnOutline}>
          <Ionicons name="ellipsis-horizontal" size={18} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  phoneText: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    marginLeft: 16,
    padding: 4,
  },
  actionBtnOutline: {
    marginLeft: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
