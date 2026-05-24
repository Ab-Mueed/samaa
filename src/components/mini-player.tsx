import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { usePlayer } from '@/context/player-context';
import { ThemedText } from './themed-text';
import { Icons } from './icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface MiniPlayerProps {
  onPress: () => void;
}

export function MiniPlayer({ onPress }: MiniPlayerProps) {
  const { currentTrack, isPlaying, togglePlay, nextTrack } = usePlayer();
  const theme = useTheme();

  if (!currentTrack) return null;

  return (
    <Pressable onPress={onPress} style={[styles.outerContainer, { backgroundColor: theme.playerBackground || '#FFF0EE', borderTopColor: theme.backgroundElement }]}>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <Image 
            source={{ uri: currentTrack.coverUrl }} 
            style={styles.coverArt as any} 
            transition={300}
          />
          <View style={styles.trackInfo}>
            <ThemedText numberOfLines={1} style={styles.trackTitle}>
              {currentTrack.title}
            </ThemedText>
            <ThemedText numberOfLines={1} type="small" themeColor="textSecondary" style={styles.artistName}>
              {currentTrack.artist}
            </ThemedText>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Pressable 
            onPress={togglePlay} 
            style={({ pressed }) => [
              styles.controlBtn,
              pressed && styles.pressed
            ]}
          >
            {isPlaying ? (
              <Icons.Pause size={24} color={theme.text} />
            ) : (
              <Icons.Play size={24} color={theme.text} />
            )}
          </Pressable>

          <Pressable 
            onPress={nextTrack} 
            style={({ pressed }) => [
              styles.controlBtn,
              pressed && styles.pressed
            ]}
          >
            <Icons.SkipForward size={24} color={theme.text} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    height: 72,
    width: '100%',
    position: (Platform.OS === 'web' ? 'fixed' : 'absolute') as any,
    bottom: Platform.OS === 'web' ? 76 : 0, // Snug above tab bars
    left: 0,
    right: 0,
    borderTopWidth: 1,
    zIndex: 900,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginRight: Spacing.three,
  },
  coverArt: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  trackTitle: {
    fontWeight: '700',
    fontSize: 15,
  },
  artistName: {
    fontSize: 13,
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  controlBtn: {
    padding: Spacing.two,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
});
