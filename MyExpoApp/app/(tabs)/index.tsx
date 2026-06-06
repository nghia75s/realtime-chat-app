import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getChatPartnersAPI } from '@/api/message.api';
import ChatListItem from '@/components/chat/ChatListItem';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);

  const { data: chatPartners, isLoading, isError, refetch } = useQuery({
    queryKey: ['chatPartners'],
    queryFn: getChatPartnersAPI,
  });

  // Filter chat partners based on search query
  const filteredPartners = chatPartners?.filter((partner: any) => {
    const name = partner.fullname || partner.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const renderHeader = () => {
    return (
      <View style={styles.headerBackground}>
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          {!isSearching ? (
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Ionicons name="chatbubbles" size={24} color="#fff" />
                <Text style={styles.headerTitle}>E-Chat</Text>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity onPress={() => setIsSearching(true)} style={styles.iconButton}>
                  <Ionicons name="search-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowAddMenu(true)} style={styles.iconButton}>
                  <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.headerContentSearch}>
              <View style={styles.searchBarContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  placeholderTextColor="#A0A0A0"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
              </View>
              <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }} style={styles.closeSearchBtn}>
                <Ionicons name="close-circle" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>
    );
  };

  const renderAddMenu = () => {
    return (
      <Modal transparent visible={showAddMenu} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowAddMenu(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownMenu}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setShowAddMenu(false);
                    // Handle Create Group logic here
                  }}
                >
                  <Ionicons name="people-outline" size={20} color="#333" style={styles.menuIcon} />
                  <Text style={styles.menuText}>Create Group</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00A3FF" />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.center}>
          <Text style={styles.errorText}>Không thể tải danh sách tin nhắn.</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderAddMenu()}
      <FlatList
        data={filteredPartners}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ChatListItem user={item} currentUserId={user?._id} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Light Theme Background
  },
  headerBackground: {
    backgroundColor: '#00A3FF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10,
  },
  headerSafeArea: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15,
    padding: 4,
  },
  headerContentSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  searchBarContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  searchInput: {
    fontSize: 16,
    color: '#333',
    padding: 0, // Remove default padding on Android
  },
  closeSearchBtn: {
    padding: 4,
  },
  // Modal & Dropdown
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 65,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    minWidth: 160,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  // List
  listContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 12,
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#00A3FF',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#A0A0A0',
    fontSize: 16,
  },
});
