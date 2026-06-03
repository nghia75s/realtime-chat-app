import React, { useState, useRef } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessagesAPI, sendMessageAPI } from '@/api/message.api';
import { useAuthStore } from '@/store/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChatHeader from '@/components/chat/ChatHeader';
import MessageBubble from '@/components/chat/MessageBubble';
import MessageInput from '@/components/chat/MessageInput';

export default function ChatScreen() {
  const { id, name, avatar } = useLocalSearchParams<{ id: string, name?: string, avatar?: string }>();
  const [text, setText] = useState('');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => getMessagesAPI(id as string),
    enabled: !!id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (newMsg: { text: string }) => sendMessageAPI(id as string, newMsg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      setText('');
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ChatHeader name={name || 'Người dùng'} avatar={avatar || ''} isOnline={true} />

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
          />
        )}

        <MessageInput 
          text={text} 
          setText={setText} 
          onSend={handleSend} 
          isPending={sendMessageMutation.isPending} 
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070913',
  },
  container: {
    flex: 1,
    backgroundColor: '#070913',
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
