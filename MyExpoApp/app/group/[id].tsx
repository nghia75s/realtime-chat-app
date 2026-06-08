import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import MessageInput from '@/components/chat/MessageInput';
import ChatHeader from '@/components/chat/ChatHeader';
import { getGroupMessagesAPI, sendGroupMessageAPI } from '@/api/group.api';

const GroupMessageItem = React.memo(({ item, isMe, isConsecutive }: { item: any; isMe: boolean; isConsecutive: boolean }) => {
  const isSystem = item.messageType === 'system';
  const timeStr = item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:10';

  if (isSystem) {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={styles.systemMessageText}>{item.text}</Text>
      </View>
    );
  }

  if (isMe) {
    return (
      <View style={styles.myWrapper}>
        <View style={[styles.bubble, styles.myBubble]}>
          <Text style={styles.myText}>{item.text}</Text>
          <View style={styles.myTimeContainer}>
            <Text style={styles.myTimeText}>{timeStr}</Text>
            <Ionicons name={item.readBy && item.readBy.length > 0 ? "checkmark-done" : "checkmark"} size={14} color={item.readBy && item.readBy.length > 0 ? "#34D399" : "#E5E7EB"} style={{ marginLeft: 4 }} />
          </View>
        </View>
        {item.readBy && item.readBy.length > 0 && (
          <View style={styles.readByContainer}>
            {item.readBy.slice(0, 5).map((reader: any, i: number) => (
              <Image 
                key={reader._id || i}
                source={{ uri: reader.profilePicture || 'https://via.placeholder.com/150' }}
                style={[styles.readByAvatar, { marginLeft: i > 0 ? -6 : 0, zIndex: 5 - i }]}
              />
            ))}
            {item.readBy.length > 5 && (
              <View style={[styles.readByAvatar, styles.readByMore, { marginLeft: -6 }]}>
                <Text style={styles.readByMoreText}>+{item.readBy.length - 5}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.theirWrapper, isConsecutive ? { marginTop: -10 } : null]}>
      {!isConsecutive ? (
        <Image 
          source={{ uri: item.senderId?.profilePicture || 'https://via.placeholder.com/150' }} 
          style={styles.senderAvatar} 
        />
      ) : (
        <View style={styles.senderAvatarSpacer} />
      )}
      <View style={styles.theirContentContainer}>
        {!isConsecutive && <Text style={styles.senderName}>{item.senderId?.fullname}</Text>}
        <View style={[styles.bubble, styles.theirBubble]}>
          <Text style={styles.theirText}>{item.text}</Text>
          <View style={styles.theirTimeContainer}>
            <Text style={styles.theirTimeText}>{timeStr}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

export default function GroupChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, name, memberCount } = useLocalSearchParams<{ id: string, name?: string, memberCount?: string }>();
  const { user, socket } = useAuthStore();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  const [text, setText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'ios') return;
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['groupMessages', id],
    queryFn: () => getGroupMessagesAPI(id as string),
    enabled: !!id,
  });

  const sendMutation = useMutation({
    mutationFn: (data: any) => sendGroupMessageAPI(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMessages', id] });
      setText('');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
  });

  useEffect(() => {
    if (!socket) return;

    const handleNewGroupMessage = (newMessage: any) => {
      if (newMessage.groupId === id) {
        queryClient.setQueryData(['groupMessages', id], (oldData: any) => {
          if (!oldData) return [newMessage];
          if (oldData.some((msg: any) => msg._id === newMessage._id)) return oldData;
          return [...oldData, newMessage];
        });

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    };

    socket.on('newGroupMessage', handleNewGroupMessage);

    return () => {
      socket.off('newGroupMessage', handleNewGroupMessage);
      queryClient.invalidateQueries({ queryKey: ['myGroups'] });
    };
  }, [socket, queryClient, id]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMutation.mutate({ text });
  };

  const renderMessageItem = React.useCallback(({ item, index }: { item: any; index: number }) => {
    const isMe = item.senderId?._id === user?._id;
    let isConsecutive = false;
    if (messages && index > 0) {
      const prevMsg = messages[index - 1];
      if (prevMsg.senderId?._id === item.senderId?._id && prevMsg.messageType !== 'system') {
        isConsecutive = true;
      }
    }

    return <GroupMessageItem item={item} isMe={isMe} isConsecutive={isConsecutive} />;
  }, [messages, user?._id]);

  return (
    <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 20) }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Sử dụng lại ChatHeader của 1-1 */}
      <ChatHeader 
        name={name || 'Nhóm'} 
        avatar={'https://via.placeholder.com/150'} // Có thể thay bằng groupPicture nếu lấy được
        phone={`${memberCount || 1} thành viên`}
        onProfilePress={() => {}} // Hoặc điều hướng sang trang group info
      />

      <KeyboardAvoidingView 
        style={[styles.container, Platform.OS === 'android' && { paddingBottom: keyboardHeight }]} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages || []}
            keyExtractor={(item) => item._id}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={Platform.OS === 'android'}
          />
        )}

        <MessageInput 
          text={text} 
          setText={setText} 
          onSend={handleSend} 
          isPending={sendMutation.isPending} 
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB', // Light gray background matching Chat 1-1
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#8A94A6',
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  myWrapper: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  theirWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    maxWidth: '85%',
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 18,
  },
  theirContentContainer: {
    flex: 1,
  },
  senderName: {
    fontSize: 12,
    color: '#8A94A6',
    marginBottom: 4,
    marginLeft: 4,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: '#00A3FF',
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  senderAvatarSpacer: {
    width: 32,
    marginRight: 8,
  },
  readByContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    marginRight: 4,
  },
  readByAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  readByMore: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readByMoreText: {
    fontSize: 6,
    color: '#4B5563',
    fontWeight: 'bold',
  },
  myText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  theirText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
  myTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  myTimeText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  theirTimeText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
