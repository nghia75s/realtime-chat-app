import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import ChatSettingItem from '@/components/chat/ChatSettingItem';

export default function ChatSettingsScreen() {
  const { id, name, avatar, phone } = useLocalSearchParams<{ id: string, name?: string, avatar?: string, phone?: string }>();
  const router = useRouter();

  // Mock states for switches
  const [isMuted, setIsMuted] = useState(false);
  const [isProtected, setIsProtected] = useState(false);
  const [isHideChat, setIsHideChat] = useState(false);
  const [isHideHistory, setIsHideHistory] = useState(false);

  const displayPhone = phone || '(+44) 20 1234 5689';
  const displayName = name || 'David Wayne';

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(displayPhone);
    // You could show a toast here
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="videocam-outline" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="call-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfile = () => (
    <View style={styles.profileContainer}>
      <Image 
        source={{ uri: avatar || 'https://via.placeholder.com/150' }} 
        style={styles.avatar} 
      />
      <Text style={styles.nameText}>{displayName}</Text>
      
      <View style={styles.phoneContainer}>
        <Text style={styles.phoneText}>{displayPhone}</Text>
        <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn}>
          <Ionicons name="copy-outline" size={16} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      {renderHeader()}
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderProfile()}

        <View style={styles.section}>
          <ChatSettingItem 
            icon="images-outline" 
            title="Media, Links & Documents" 
            type="count" 
            value="152" 
            onPress={() => router.push(`/chat/media/${id}?name=${name}&avatar=${avatar}`)} 
          />
          <ChatSettingItem 
            icon="volume-mute-outline" 
            title="Mute Notification" 
            type="switch" 
            value={isMuted} 
            onToggle={setIsMuted} 
          />
          <ChatSettingItem 
            icon="notifications-outline" 
            title="Custom Notification" 
            type="link" 
            onPress={() => {}} 
          />
          <ChatSettingItem 
            icon="shield-checkmark-outline" 
            title="Protected Chat" 
            type="switch" 
            value={isProtected} 
            onToggle={setIsProtected}
            onPress={() => router.push(`/chat/protected/${id}?name=${name}&avatar=${avatar}`)} 
          />
          <ChatSettingItem 
            icon="eye-off-outline" 
            title="Hide Chat" 
            type="switch" 
            value={isHideChat} 
            onToggle={setIsHideChat}
            onPress={() => {}} 
          />
          <ChatSettingItem 
            icon="time-outline" 
            title="Hide Chat History" 
            type="switch" 
            value={isHideHistory} 
            onToggle={setIsHideHistory}
            onPress={() => {}} 
          />
          <ChatSettingItem 
            icon="people-outline" 
            title="Add To Group" 
            type="link" 
            onPress={() => {}} 
          />
          <ChatSettingItem 
            icon="color-palette-outline" 
            title="Custom Color Chat" 
            type="color" 
            value="#00A3FF" 
          />
          <ChatSettingItem 
            icon="image-outline" 
            title="Custom Background Chat" 
            type="color" 
            value="#F0F0F0" 
          />
          
          {/* Danger Zone */}
          <ChatSettingItem 
            icon="warning-outline" 
            title="Report" 
            type="link" 
            danger 
            onPress={() => {}} 
          />
          <ChatSettingItem 
            icon="ban-outline" 
            title="Block" 
            type="link" 
            danger 
            onPress={() => {}} 
          />
        </View>
        
        {/* Extra space at bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    padding: 8,
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  copyBtn: {
    padding: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
  },
});
