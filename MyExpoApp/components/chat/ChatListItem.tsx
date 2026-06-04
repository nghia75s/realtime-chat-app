import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface ChatListItemProps {
  user: any;
  currentUserId?: string;
}

export default function ChatListItem({ user, currentUserId }: ChatListItemProps) {
  const router = useRouter();

  // Handle both direct users and groups
  const id = user._id;
  const name = user.fullname || user.name || 'Người dùng';
  const avatar = user.profilePicture || user.groupPicture || 'https://via.placeholder.com/50';
  
  const lastMessageText = user.lastMessage?.text || 'Bắt đầu nhắn tin...';
  // simple date format for now
  const dateStr = user.lastMessageDate ? new Date(user.lastMessageDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:45';
  
  const isMe = user.lastMessage?.senderId === currentUserId;
  // Giả lập số tin nhắn chưa đọc để làm UI theo thiết kế Figma (sẽ thay bằng API thật sau)
  const unreadCount = user.unreadCount || 0; 

  const handlePress = () => {
    router.push({
      pathname: '/chat/[id]',
      params: { id, name, avatar }
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {isMe && <Ionicons name="checkmark-done" size={14} color="#00A3FF" style={{marginRight: 4}} />}
            {isMe ? ' Bạn: ' : ''}
            {lastMessageText}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Light Theme
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: '#F0F0F0', // Placeholder bg
  },
  content: {
    flex: 1,
    borderBottomWidth: 1, // Optional: add separator only on the content side like some apps, or none
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
    marginRight: 12,
  },
  unreadBadge: {
    backgroundColor: '#00A3FF',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
