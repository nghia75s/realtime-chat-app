import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import ChatSubHeader from '@/components/chat/ChatSubHeader';
import ChatSettingItem from '@/components/chat/ChatSettingItem';

export default function ProtectedChatScreen() {
  const { name } = useLocalSearchParams<{ id: string, name?: string }>();
  const displayName = name || 'David Wayne';

  // Mock states for security toggles
  const [isProtected, setIsProtected] = useState(true); // Default to true to match design
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [isFaceEnabled, setIsFaceEnabled] = useState(false);
  const [isFingerprintEnabled, setIsFingerprintEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ChatSubHeader title={displayName} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ChatSettingItem 
            icon="shield-checkmark-outline" 
            title="Protected Chat" 
            type="switch" 
            value={isProtected} 
            onToggle={setIsProtected} 
          />
          
          <ChatSettingItem 
            icon="keypad-outline" 
            title="PIN Security" 
            type="switch" 
            value={isPinEnabled} 
            onToggle={setIsPinEnabled} 
          />
          
          <ChatSettingItem 
            icon="scan-outline" 
            title="Face Recognition" 
            type="switch" 
            value={isFaceEnabled} 
            onToggle={setIsFaceEnabled} 
          />
          
          <ChatSettingItem 
            icon="finger-print-outline" 
            title="Fingerprint Security" 
            type="switch" 
            value={isFingerprintEnabled} 
            onToggle={setIsFingerprintEnabled} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
  },
});
