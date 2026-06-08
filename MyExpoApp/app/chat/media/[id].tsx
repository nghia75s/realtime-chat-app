import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatSubHeader from '@/components/chat/ChatSubHeader';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 3; // 3 columns, 16 padding on each side, 8 gap between

export default function ChatMediaScreen() {
  const { name } = useLocalSearchParams<{ id: string, name?: string }>();
  const [activeTab, setActiveTab] = useState<'media' | 'links' | 'docs'>('media');

  const displayName = name || 'David Wayne';

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity 
        style={[styles.tabBtn, activeTab === 'media' && styles.activeTabBtn]} 
        onPress={() => setActiveTab('media')}
      >
        <Text style={[styles.tabText, activeTab === 'media' && styles.activeTabText]}>Media</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tabBtn, activeTab === 'links' && styles.activeTabBtn]} 
        onPress={() => setActiveTab('links')}
      >
        <Text style={[styles.tabText, activeTab === 'links' && styles.activeTabText]}>Links</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tabBtn, activeTab === 'docs' && styles.activeTabBtn]} 
        onPress={() => setActiveTab('docs')}
      >
        <Text style={[styles.tabText, activeTab === 'docs' && styles.activeTabText]}>Documents</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMedia = () => (
    <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.dateHeader}>Today</Text>
      <View style={styles.mediaGrid}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366' }} style={styles.mediaItem} />
        <Image source={{ uri: 'https://images.unsplash.com/photo-1506744626753-1fa44df31c78' }} style={styles.mediaItem} />
      </View>

      <Text style={styles.dateHeader}>Yesterday</Text>
      <View style={styles.mediaGrid}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e' }} style={styles.mediaItem} />
        <Image source={{ uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e' }} style={styles.mediaItem} />
        <Image source={{ uri: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8' }} style={styles.mediaItem} />
        <Image source={{ uri: 'https://images.unsplash.com/photo-1444464666168-49b626422849' }} style={styles.mediaItem} />
      </View>
    </ScrollView>
  );

  const renderLinks = () => (
    <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.dateHeader}>Today</Text>
      
      <View style={styles.linkCard}>
        <View style={styles.linkImagePlaceholder}>
          <Text style={styles.linkPlaceholderText}>UI</Text>
        </View>
        <View style={styles.linkInfo}>
          <Text style={styles.linkTitle} numberOfLines={1}>160+ FREE Tab Bar Component Types</Text>
          <Text style={styles.linkUrl} numberOfLines={1}>https://www.figma.com/community/...</Text>
        </View>
      </View>

      <View style={styles.linkCard}>
        <View style={styles.linkImagePlaceholder}>
          <Text style={styles.linkPlaceholderText}>UX</Text>
        </View>
        <View style={styles.linkInfo}>
          <Text style={styles.linkTitle} numberOfLines={1}>Speedy Chow | Food Delivery App UI Kit</Text>
          <Text style={styles.linkUrl} numberOfLines={1}>https://www.figma.com/community/...</Text>
        </View>
      </View>

      <Text style={styles.dateHeader}>Yesterday</Text>
      <View style={styles.linkCard}>
        <View style={styles.linkImagePlaceholder}>
          <Text style={styles.linkPlaceholderText}>WEB</Text>
        </View>
        <View style={styles.linkInfo}>
          <Text style={styles.linkTitle} numberOfLines={1}>150+ FREE Stepper / Wizard Components</Text>
          <Text style={styles.linkUrl} numberOfLines={1}>https://www.figma.com/community/...</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderDocs = () => (
    <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.dateHeader}>Today</Text>
      
      <View style={styles.docCard}>
        <View style={[styles.docIconWrapper, { backgroundColor: '#FFB800' }]}>
          <Text style={styles.docIconText}>doc</Text>
        </View>
        <View style={styles.docInfo}>
          <Text style={styles.docTitle} numberOfLines={1}>Don Quixote</Text>
          <Text style={styles.docSize}>24 MB</Text>
        </View>
        <TouchableOpacity style={styles.downloadBtn}>
          <Ionicons name="download-outline" size={20} color="#00A3FF" />
        </TouchableOpacity>
      </View>

      <View style={styles.docCard}>
        <View style={[styles.docIconWrapper, { backgroundColor: '#34C759' }]}>
          <Text style={styles.docIconText}>cdr</Text>
        </View>
        <View style={styles.docInfo}>
          <Text style={styles.docTitle} numberOfLines={1}>Design System</Text>
          <Text style={styles.docSize}>1.5 GB</Text>
        </View>
        <TouchableOpacity style={styles.downloadBtn}>
          <Ionicons name="download-outline" size={20} color="#00A3FF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.dateHeader}>Yesterday</Text>
      <View style={styles.docCard}>
        <View style={[styles.docIconWrapper, { backgroundColor: '#FF3B30' }]}>
          <Text style={styles.docIconText}>pdf</Text>
        </View>
        <View style={styles.docInfo}>
          <Text style={styles.docTitle} numberOfLines={1}>The Lord of the Rings</Text>
          <Text style={styles.docSize}>20.8 GB</Text>
        </View>
        <TouchableOpacity style={styles.downloadBtn}>
          <Ionicons name="download-outline" size={20} color="#00A3FF" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ChatSubHeader title={displayName} />
      
      {renderTabs()}

      <View style={styles.contentContainer}>
        {activeTab === 'media' && renderMedia()}
        {activeTab === 'links' && renderLinks()}
        {activeTab === 'docs' && renderDocs()}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabBtn: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  tabText: {
    fontSize: 15,
    color: '#A0A0A0',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  contentScroll: {
    paddingHorizontal: 16,
  },
  dateHeader: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 10,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaItem: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  linkImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E0E5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkPlaceholderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 13,
    color: '#A0A0A0',
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  docIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  docIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  docSize: {
    fontSize: 13,
    color: '#A0A0A0',
  },
  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
