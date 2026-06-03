import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

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
  const dateStr = user.lastMessageDate ? new Date(user.lastMessageDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  const handlePress = () => {
    router.push({
      pathname: '/chat/[id]',
      params: { id, name, avatar }
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {user.lastMessage?.senderId === currentUserId ? 'Bạn: ' : ''}
          {lastMessageText}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1c22',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
  },
  lastMessage: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
