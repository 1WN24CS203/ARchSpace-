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
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="image-multiple" size={size} color={color} />
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
    </Tabs>
  );
}

