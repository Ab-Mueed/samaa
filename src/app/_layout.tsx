import React, { useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme, View, StyleSheet } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { PlayerProvider } from '@/context/player-context';
import { MiniPlayer } from '@/components/mini-player';
import { PlayerView } from '@/components/player-view';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [playerVisible, setPlayerVisible] = useState(false);

  return (
    <PlayerProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={styles.rootContainer}>
          <AnimatedSplashOverlay />
          
          {/* Main Tab Routes */}
          <AppTabs />

          {/* Persistent Player UI Elements */}
          <MiniPlayer onPress={() => setPlayerVisible(true)} />
          
          <PlayerView 
            visible={playerVisible} 
            onClose={() => setPlayerVisible(false)} 
          />
        </View>
      </ThemeProvider>
    </PlayerProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    position: 'relative',
  },
});
