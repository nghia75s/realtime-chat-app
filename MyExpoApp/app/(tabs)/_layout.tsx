import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00A3FF',
        tabBarInactiveTintColor: '#A0A0A0',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: 70, // Fixed height
          paddingTop: 8,
          paddingBottom: 8,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? '#00A3FF' : 'transparent',
              borderRadius: 12,
              width: 50,
              height: 50,
            }}>
              <Ionicons size={22} name={focused ? "chatbubble" : "chatbubble-outline"} color={focused ? "#FFFFFF" : color} />
              <Text style={{ color: focused ? '#FFFFFF' : color, fontSize: 10, marginTop: 4, fontWeight: focused ? 'bold' : 'normal' }}>Chats</Text>
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? '#00A3FF' : 'transparent',
              borderRadius: 12,
              width: 50,
              height: 50,
            }}>
              <Ionicons size={22} name={focused ? "people" : "people-outline"} color={focused ? "#FFFFFF" : color} />
              <Text style={{ color: focused ? '#FFFFFF' : color, fontSize: 10, marginTop: 4, fontWeight: focused ? 'bold' : 'normal' }}>Groups</Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? '#00A3FF' : 'transparent',
              borderRadius: 12,
              width: 50,
              height: 50,
            }}>
              <Ionicons size={22} name={focused ? "person" : "person-outline"} color={focused ? "#FFFFFF" : color} />
              <Text style={{ color: focused ? '#FFFFFF' : color, fontSize: 10, marginTop: 4, fontWeight: focused ? 'bold' : 'normal' }}>Profile</Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? '#00A3FF' : 'transparent',
              borderRadius: 12,
              width: 50,
              height: 50,
            }}>
              <Ionicons size={22} name={focused ? "menu" : "menu-outline"} color={focused ? "#FFFFFF" : color} />
              <Text style={{ color: focused ? '#FFFFFF' : color, fontSize: 10, marginTop: 4, fontWeight: focused ? 'bold' : 'normal' }}>More</Text>
            </View>
          ),
        }}
      />

      {/* Hidden legacy tab if it still exists */}
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
