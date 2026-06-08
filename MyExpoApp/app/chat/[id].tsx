import React, { useState, useRef } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessagesAPI, sendMessageAPI } from '@/api/message.api';
import { useAuthStore } from '@/store/useAuthStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageBubble from '@/components/chat/MessageBubble';
import MessageInput from '@/components/chat/MessageInput';
import { useEffect } from 'react';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { id, name, avatar } = useLocalSearchParams<{ id: string, name?: string, avatar?: string }>();
  const router = useRouter();
  const [text, setText] = useState('');
  const { user, socket } = useAuthStore();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'ios') return;
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => getMessagesAPI(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: any) => {
      // Check if message belongs to this conversation
      const isForThisChat = newMessage.senderId === id || newMessage.receiverId === id ||
        (newMessage.senderId?._id && newMessage.senderId._id === id);

      if (isForThisChat) {
        queryClient.setQueryData(['messages', id], (oldData: any) => {
          if (!oldData) return [newMessage];
          // Prevent duplicates
          if (oldData.some((msg: any) => msg._id === newMessage._id)) return oldData;
          return [...oldData, newMessage];
        });

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      queryClient.invalidateQueries({ queryKey: ['chatPartners'] });
    };
  }, [socket, id, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: (newMsg: { text: string }) => sendMessageAPI(id as string, newMsg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      setText('');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
  });

  const handleSend = () => {
    if (text.trim()) {
      sendMessageMutation.mutate({ text });
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === user?._id;
    return <MessageBubble item={item} isMe={isMe} avatar={avatar} />;
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: 0 }]}>
      <ChatHeader
        name={name || 'Người dùng'}
        avatar={avatar || ''}
        onProfilePress={() => router.push(`/chat/settings/${id}?name=${name}&avatar=${avatar}`)}
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
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderMessage}
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
          isPending={sendMessageMutation.isPending}
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
    backgroundColor: '#FFFFFF',
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
});
