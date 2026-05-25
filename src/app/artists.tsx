import React from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Pressable
} from 'react-native';
import { Image } from 'expo-image';
import { usePlayer } from '@/context/player-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

export default function ArtistsScreen() {
  const { tracks } = usePlayer();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Create list of unique artists
  const artistsMap = new Map<string, { name: string; avatar: string; trackCount: number }>();
  
  tracks.forEach(track => {
    if (!artistsMap.has(track.artist)) {
      artistsMap.set(track.artist, {
        name: track.artist,
        avatar: track.coverUrl, // reuse coverUrl as avatar for beautiful visual coherence
        trackCount: 1
      });
    } else {
      const existing = artistsMap.get(track.artist)!;
      artistsMap.set(track.artist, {
        ...existing,
        trackCount: existing.trackCount + 1
      });
    }
  });

  const artists = Array.from(artistsMap.values());

  const navigateToArtist = (artistName: string) => {
    // Navigate using encodeURIComponent so any spaces are handled safely in dynamic route
    router.push(`/artists/${encodeURIComponent(artistName)}`);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: Spacing.three }]}>
          <ThemedText type="subtitle" style={styles.headerTitle}>Spiritual Chanters</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Discover {artists.length} featured vocal artists
          </ThemedText>
        </View>

        {/* ARTISTS GRID */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.gridContainer}>
            {artists.map((artist, idx) => (
              <Pressable 
                key={idx}
                onPress={() => navigateToArtist(artist.name)}
                style={({ pressed }) => [styles.gridItem, pressed && styles.pressed]}
              >
                <Image 
                  source={{ uri: artist.avatar }} 
                  style={[styles.avatar as any, { borderColor: theme.backgroundElement }]} 
                  transition={250}
                />
                <ThemedText style={styles.artistName}>{artist.name}</ThemedText>
                <View style={styles.badge}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {artist.trackCount} {artist.trackCount === 1 ? 'Nasheed' : 'Nasheeds'}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Padding for bottom floating overlay players */}
          <View style={{ height: 160 }} />
        </ScrollView>

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 28,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.one,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  gridItem: {
    width: '48%', // neat double column grid
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 16,
    marginBottom: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.015)',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    marginBottom: Spacing.two,
  },
  artistName: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  badge: {
    marginTop: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
