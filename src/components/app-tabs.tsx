import { Tabs } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Icons } from './icons';

export default function AppTabs() {
  const colors = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundElement,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: colors.primary || '#8F302A',
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontWeight: 'bold',
          fontSize: 12,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Icons.Home color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => (
            <Icons.Search color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => (
            <Icons.Playlists color={color} size={24} />
          ),
        }}
      />
      
      {/* Hide auxiliary/legacy routes from bottom tabs listing */}
      <Tabs.Screen
        name="songs"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="artists"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="artists/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="albums"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="playlists"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
