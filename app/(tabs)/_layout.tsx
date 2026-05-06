import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.secondary,
          borderBottomWidth: 1,
          borderBottomColor: Colors.borderSubtle,
        },
        headerTintColor: Colors.textMain,
        headerTitleStyle: {
          fontFamily: 'PlayfairDisplay-Regular',
          fontSize: 20,
        },
        tabBarStyle: {
          backgroundColor: Colors.secondary,
          borderTopWidth: 1,
          borderTopColor: Colors.borderSubtle,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.accentGold,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: 'Lato-Regular',
          fontSize: 10,
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="portfolio" options={{ href: null }} />
      <Tabs.Screen
        name="my-projects"
        options={{
          title: 'My Projects',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="folder-multiple" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="furniture"
        options={{
          title: 'Furniture',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="sofa" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calculator" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="logout"
        options={{
          title: 'Sign Out',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="logout-variant" size={size} color={color} />
          ),
          tabBarActiveTintColor: '#FF6B6B',
        }}
      />
    </Tabs>
  );
}

