import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'expo-router';

export default function MoreScreen() {
  const { logout } = useAuthStore();
  const router = useRouter();

  // Mock states for UI
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMute, setIsMute] = useState(false);
  const [isHideChat, setIsHideChat] = useState(false);
  const [isSecurity, setIsSecurity] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const renderHeader = () => (
    <View style={styles.headerBackground}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="chatbubbles" size={24} color="#fff" />
            <Text style={styles.headerTitle}>E-Chat</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );

  const renderMenuItem = (
    icon: any, 
    label: string, 
    type: 'link' | 'switch' | 'dropdown' | 'action',
    value?: any,
    onValueChange?: (val: boolean) => void,
    onPress?: () => void,
    color: string = '#333'
  ) => {
    return (
      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={onPress} 
        disabled={type === 'switch'} // Switches are handled by the Switch component
        activeOpacity={0.7}
      >
        <Ionicons name={icon} size={24} color={color} style={styles.menuIcon} />
        <Text style={[styles.menuLabel, { color }]}>{label}</Text>
        
        {type === 'link' && <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />}
        
        {type === 'switch' && (
          <View style={styles.switchContainer}>
            <Switch
              value={value}
              onValueChange={onValueChange}
              trackColor={{ false: '#D1D1D6', true: '#00A3FF' }}
              thumbColor="#FFFFFF"
            />
            {/* If it also needs an arrow like Hide Chat History in the design */}
            {label === 'Hide Chat History' || label === 'Security' ? (
               <Ionicons name="chevron-forward" size={20} color="#A0A0A0" style={{marginLeft: 10}} />
            ) : null}
          </View>
        )}
        
        {type === 'dropdown' && (
          <View style={styles.dropdownBox}>
            <Text style={styles.dropdownText}>English</Text>
            <Ionicons name="chevron-down" size={16} color="#333" style={{marginLeft: 4}} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.section}>
          {renderMenuItem('text-outline', 'Language', 'dropdown')}
          {renderMenuItem('moon-outline', 'Dark Mode', 'switch', isDarkMode, setIsDarkMode)}
          {renderMenuItem('volume-mute-outline', 'Mute Notification', 'switch', isMute, setIsMute)}
          {renderMenuItem('notifications-outline', 'Custom Notification', 'link')}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          {renderMenuItem('person-add-outline', 'Invite Friends', 'link')}
          {renderMenuItem('people-outline', 'Joined Groups', 'link')}
          {renderMenuItem('eye-off-outline', 'Hide Chat History', 'switch', isHideChat, setIsHideChat)}
          {renderMenuItem('shield-checkmark-outline', 'Security', 'switch', isSecurity, setIsSecurity)}
          {renderMenuItem('document-text-outline', 'Term of Service', 'link')}
          {renderMenuItem('layers-outline', 'About App', 'link')}
          {renderMenuItem('help-circle-outline', 'Help Center', 'link')}
        </View>

        <View style={styles.section}>
          {renderMenuItem('log-out-outline', 'Logout', 'action', null, undefined, handleLogout, '#FF3B30')}
        </View>
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
});
