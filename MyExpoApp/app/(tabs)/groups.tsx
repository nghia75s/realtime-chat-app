import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getMyGroupsAPI } from '@/api/group.api';
import { useAuthStore } from '@/store/useAuthStore';
import { formatShortDate } from '../../lib/formatTime';

const GroupAvatar = ({ group }: { group: any }) => {
  if (group.groupPicture) {
    return <Image source={{ uri: group.groupPicture }} style={styles.groupAvatarImage} />;
  }

  // Render stacked avatars
  const members = group.members || [];
  const displayMembers = members.slice(0, 2);
  const extraCount = members.length - 2;

  return (
    <View style={styles.stackedAvatarContainer}>
      {displayMembers.map((member: any, index: number) => (
        <Image
          key={member._id}
          source={{ uri: member.profilePicture || 'https://via.placeholder.com/150' }}
          style={[styles.stackedAvatar, { left: index * 15, zIndex: 3 - index }]}
        />
      ))}
      {extraCount > 0 && (
        <View style={[styles.stackedExtra, { left: displayMembers.length * 15, zIndex: 1 }]}>
          <Text style={styles.stackedExtraText}>+{extraCount}</Text>
        </View>
      )}
    </View>
  );
};

export default function GroupsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { socket } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: groups, isLoading, refetch } = useQuery({
    queryKey: ['myGroups'],
    queryFn: getMyGroupsAPI,
  });

  useEffect(() => {
    if (!socket) return;

    const handleNewGroupMessage = () => {
      // Invalidate the query to fetch updated groups list (for lastMessage and unreadCount)
      queryClient.invalidateQueries({ queryKey: ['myGroups'] });
    };

    socket.on('newGroupMessage', handleNewGroupMessage);

    return () => {
      socket.off('newGroupMessage', handleNewGroupMessage);
    };
  }, [socket, queryClient]);

  const renderGroupItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.groupItem}
        onPress={() => router.push(`/group/${item._id}?name=${encodeURIComponent(item.name || '')}&memberCount=${item.members?.length || 0}` as any)}
      >
        <GroupAvatar group={item} />

        <View style={styles.groupInfo}>
          <Text style={styles.groupName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage ? item.lastMessage.text || 'Đã gửi một đính kèm' : 'Chưa có tin nhắn'}
          </Text>
        </View>

        <View style={styles.groupMeta}>
          <Text style={styles.timeText}>
            {item.lastMessageDate ? formatShortDate(item.lastMessageDate) : formatShortDate(item.createdAt)}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.headerBackground, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <Ionicons name="chatbubbles" size={26} color="#FFF" />
            <Text style={styles.logoText}>E-Chat</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="search-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="add" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Group List */}
      <FlatList
        data={groups || []}
        keyExtractor={(item) => item._id}
        renderItem={renderGroupItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Bạn chưa tham gia nhóm nào.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBackground: {
    backgroundColor: '#1B64B3',
    height: 120,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    marginLeft: 20,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  groupAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  stackedAvatarContainer: {
    width: 60,
    height: 56,
    position: 'relative',
    justifyContent: 'center',
  },
  stackedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  stackedExtra: {
    width: 44,
    height: 44,
    borderRadius: 22,
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackedExtraText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  groupInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#8A94A6',
  },
  groupMeta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#8A94A6',
    marginBottom: 6,
  },
  unreadBadge: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8A94A6',
    fontSize: 16,
  },
});
