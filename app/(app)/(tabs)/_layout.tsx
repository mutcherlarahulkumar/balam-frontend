import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import LoadingState from '@/components/common/LoadingState';

function TabIcon({ name, focused, color }: { name: keyof typeof Ionicons.glyphMap; focused: boolean; color: string }) {
  return <Ionicons name={focused ? name : `${name}-outline` as keyof typeof Ionicons.glyphMap} size={24} color={color} />;
}

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const paperTheme = useTheme();

  if (isLoading) return <LoadingState />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: paperTheme.colors.primary,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          height: Platform.OS === 'android' ? 64 : 80,
          paddingBottom: Platform.OS === 'android' ? 8 : 20,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          backgroundColor: '#fff',
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => <TabIcon name="home" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="policies"
        options={{
          title: 'Policies',
          tabBarIcon: ({ focused, color }) => <TabIcon name="document-text" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fup"
        options={{
          title: 'FUP',
          tabBarIcon: ({ focused, color }) => <TabIcon name="calendar" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="families"
        options={{
          title: 'Families',
          tabBarIcon: ({ focused, color }) => <TabIcon name="people" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ focused, color }) => <TabIcon name="apps" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}
