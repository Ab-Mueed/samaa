import React from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Pressable,
  SafeAreaView
} from 'react-native';
import { Image } from 'expo-image';
import { usePlayer } from '@/context/player-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';

export default function AlbumsScreen() {
  const { tracks, playAll } = usePlayer();
  const theme = useTheme();

  // Create list of unique albums
  const albumsMap = new Map<string, { title: string; artist: string; cover: string; trackCount: number }>();
  
  tracks.forEach(track => {
    if (!albumsMap.has(track.album)) {
      albumsMap.set(track.album, {
        title: track.album,
        artist: track.artist,
        cover: track.coverUrl,
        trackCount: 1
      });
    } else {
      const existing = albumsMap.get(track.album)!;
      albumsMap.set(track.album, {
        ...existing,
        trackCount: existing.trackCount + 1
      });
    }
  });

  const albums = Array.from(albumsMap.values());

  const handlePlayAlbum = (albumTitle: string) => {
    const albumTracks = tracks.filter(t => t.album === albumTitle);
    if (albumTracks.length > 0) {
      playAll(albumTracks, 0);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.headerTitle}>Spiritual Albums</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Explore {albums.length} thematic vocal compilations
          </ThemedText>
        </View>

        {/* ALBUMS GRID */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.gridContainer}>
            {albums.map((album, idx) => (
              <Pressable 
                key={idx}
                onPress={() => handlePlayAlbum(album.title)}
                style={({ pressed }) => [styles.gridItem, pressed && styles.pressed]}
              >
                <Image 
                  source={{ uri: album.cover }} 
                  style={[styles.albumCover as any, { borderColor: theme.backgroundElement }]} 
                  transition={250}
                />
                <View style={styles.albumMeta}>
                  <ThemedText numberOfLines={1} style={styles.albumTitleText}>{album.title}</ThemedText>
                  <ThemedText numberOfLines={1} type="small" themeColor="textSecondary">
                    {album.artist}
                  </ThemedText>
                  <ThemedText numberOfLines={1} type="small" themeColor="textSecondary" style={styles.tracksCountText}>
                    {album.trackCount} {album.trackCount === 1 ? 'track' : 'tracks'}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Padding for bottom floating player overlay */}
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
    width: '48%',
    marginBottom: Spacing.three,
  },
  albumCover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.one,
  },
  albumMeta: {
    paddingHorizontal: 4,
  },
  albumTitleText: {
    fontWeight: '800',
    fontSize: 15,
  },
  tracksCountText: {
    fontSize: 12,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
