import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Platform, ActivityIndicator, Animated } from 'react-native';
import { Image } from 'expo-image';
import { usePlayer } from '@/context/player-context';
import { ThemedText } from './themed-text';
import { Icons } from './icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, BottomTabInset } from '@/constants/theme';

interface MiniPlayerProps {
  onPress: () => void;
}

export function MiniPlayer({ onPress }: MiniPlayerProps) {
  const { currentTrack, isPlaying, isBuffering, togglePlay, nextTrack } = usePlayer();
  const theme = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    if (currentTrack) {
      fadeAnim.setValue(0);
      slideAnim.setValue(15);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentTrack?.id]);

  if (!currentTrack) return null;

  return (
    <Animated.View 
      style={[
        styles.outerContainer, 
        { 
          backgroundColor: theme.playerBackground || '#FFF0EE', 
          borderColor: theme.backgroundSelected || theme.backgroundElement,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Pressable onPress={onPress} style={styles.container}>
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
            disabled={isBuffering}
            style={({ pressed }) => [
              styles.controlBtn,
              pressed && styles.pressed
            ]}
          >
            {isBuffering ? (
              <ActivityIndicator size="small" color={theme.text} />
            ) : isPlaying ? (
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
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    height: 72,
    position: (Platform.OS === 'web' ? 'fixed' : 'absolute') as any,
    bottom: Platform.OS === 'web' ? 84 : BottomTabInset + 8, // Snug yet floating elegantly
    left: Spacing.three,
    right: Spacing.three,
    borderRadius: 36, // Fully rounded capsule shape! (exactly half of height 72)
    borderWidth: 1.5, // Border outlines for unified Material You design
    zIndex: 900,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    borderRadius: 36, // Keep touch highlights nested inside rounded capsule bounds
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
    borderRadius: 24, // Circular album art!
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
    opacity: 0.55,
    transform: [{ scale: 0.88 }], // Elastic spring press scaling
  },
});
