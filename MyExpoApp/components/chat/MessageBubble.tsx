import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessageBubbleProps {
  item: any;
  isMe: boolean;
  avatar?: string;
}

export default function MessageBubble({ item, isMe }: MessageBubbleProps) {
  // Mock time
  const timeStr = item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:10';

  if (isMe) {
    return (
      <View style={styles.myWrapper}>
        <View style={[styles.bubble, styles.myBubble]}>
          <Text style={styles.myText}>{item.text}</Text>
          <View style={styles.myTimeContainer}>
            <Text style={styles.myTimeText}>{timeStr}</Text>
            <Ionicons name="checkmark-done" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.theirWrapper}>
      <View style={[styles.bubble, styles.theirBubble]}>
        <Text style={styles.theirText}>{item.text}</Text>
      </View>
      <Text style={styles.theirTimeText}>{timeStr}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  myWrapper: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  theirWrapper: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: '#00A3FF',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#FFFFFF', // Light gray/white
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1, // Slight elevation to separate from background
  },
  myText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  theirText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333333',
  },
  myTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  myTimeText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  theirTimeText: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 6,
    marginLeft: 4,
  },
});
