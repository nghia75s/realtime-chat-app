import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface MessageInputProps {
  text: string;
  setText: (text: string) => void;
  onSend: () => void;
  isPending: boolean;
}

export default function MessageInput({ text, setText, onSend, isPending }: MessageInputProps) {
  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputTools}>
        <TouchableOpacity style={styles.toolBtn}>
          <IconSymbol name="face.smiling" size={24} color="#8E8E93" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn}>
          <IconSymbol name="photo" size={24} color="#8E8E93" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn}>
          <IconSymbol name="paperclip" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#8E8E93"
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!text.trim() || isPending) && styles.sendButtonDisabled]} 
          onPress={onSend}
          disabled={isPending || !text.trim()}
        >
          <IconSymbol name="paperplane.fill" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: '#1a1c22',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2d36',
  },
  inputTools: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  toolBtn: {
    padding: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#070913',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 100,
    minHeight: 40,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2a2d36',
  },
  sendButton: {
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#1d4ed8',
    opacity: 0.5,
  },
});
