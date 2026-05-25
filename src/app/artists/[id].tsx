import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Pressable, 
  Dimensions,
  Share,
  Platform,
  BackHandler
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlayer, Track } from '@/context/player-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  
  const { tracks, playTrack, playAll, likes, toggleLike } = usePlayer();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // Decode the artist name from route param (fallback to Maher Zain)
  const artistName = id ? decodeURIComponent(id as string) : 'Maher Zain';
  
  // Find all tracks by this artist
  const artistTracks = tracks.filter(t => t.artist === artistName);

  const [artistLiked, setArtistLiked] = useState(false);

  const handleShufflePlay = () => {
    if (artistTracks.length > 0) {
      // Shuffle tracks and play
      const shuffled = [...artistTracks].sort(() => Math.random() - 0.5);
      playAll(shuffled, 0);
    }
  };

  const handleRadioPlay = () => {
    if (artistTracks.length > 0) {
      // Loop tracks like a radio station
      playAll(artistTracks, 0);
    }
  };

  const handleShareArtist = async () => {
    try {
      await Share.share({
        message: `Listen to spiritual chanters like "${artistName}" on Samaa Nasheed App!`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  // Safe fallback artwork in case the artist doesn't have tracks
  const bannerImage = artistTracks.length > 0 ? artistTracks[0].coverUrl : 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=80';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* BANNER COVER IMAGE - SCREENSHOT 1 */}
          <View style={styles.bannerContainer}>
            <Image 
              source={{ uri: bannerImage }} 
              style={styles.bannerImage as any} 
            />
            {/* Dynamic red-tone overlay filter */}
            <View style={styles.bannerOverlayRed} />
            <View style={styles.bannerOverlayFade} />

            {/* FLOATING ACTION KEYS */}
            <View style={[styles.bannerNavRow, { paddingTop: Math.max(Spacing.three, insets.top) }]}>
              <Pressable 
                onPress={() => router.back()} 
                style={[styles.floatingCircleBtn, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
              >
                <Icons.ArrowLeft size={22} color="#FFF" />
              </Pressable>
              
              <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                <Pressable 
                  onPress={() => setArtistLiked(!artistLiked)} 
                  style={[styles.floatingCircleBtn, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
                >
                  <Icons.Heart size={22} color={artistLiked ? '#E03B3B' : '#FFF'} fill={artistLiked ? '#E03B3B' : 'transparent'} />
                </Pressable>
                <Pressable 
                  onPress={handleShareArtist} 
                  style={[styles.floatingCircleBtn, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
                >
                  <Icons.Share size={22} color="#FFF" />
                </Pressable>
              </View>
            </View>

            {/* ARTIST NAME OVERLAY - SCREENSHOT 1 */}
            <ThemedText style={styles.bannerArtistTitle}>
              {artistName.toUpperCase()}
            </ThemedText>
          </View>

          {/* SHUFFLE & RADIO MD3 BUTTON DECK - SCREENSHOT 1 */}
          <View style={styles.buttonsDeck}>
            <Pressable 
              onPress={handleShufflePlay} 
              style={({ pressed }) => [
                styles.shuffleBtn, 
                { backgroundColor: theme.primary || '#8F302A' },
                pressed && styles.pressed
              ]}
            >
              <Icons.Shuffle size={18} color="#FFF" />
              <ThemedText style={styles.shuffleBtnText}>Shuffle</ThemedText>
            </Pressable>

            <Pressable 
              onPress={handleRadioPlay} 
              style={({ pressed }) => [
                styles.radioBtn, 
                { borderColor: theme.outline },
                pressed && styles.pressed
              ]}
            >
              <Icons.Volume size={18} color={theme.text} />
              <ThemedText style={[styles.radioBtnText, { color: theme.text }]}>Radio</ThemedText>
            </Pressable>
          </View>

          {/* FROM YOUR LIBRARY SUBSECTION - SCREENSHOT 1 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>From your library</ThemedText>
              <Icons.ArrowRight size={20} color={theme.primary} />
            </View>

            {artistTracks.slice(0, 2).map((track, index) => {
              const isLiked = likes.includes(track.id);
              return (
                <Pressable 
                  key={`lib-${track.id}`}
                  onPress={() => playTrack(track)}
                  style={styles.trackListItem}
                >
                  <Image source={{ uri: track.coverUrl }} style={styles.trackCover as any} />
                  <View style={styles.trackMeta}>
                    <ThemedText style={styles.trackName}>{track.title}</ThemedText>
                    <View style={styles.trackInfoSubtitle}>
                      {index === 0 ? (
                        // Item with download indicator as in Screenshot 1
                        <Icons.Download size={14} color={theme.textSecondary} style={{ marginRight: 4 }} />
                      ) : (
                        // Item with heart indicator as in Screenshot 1
                        <Icons.Heart size={14} color="#E03B3B" fill="#E03B3B" style={{ marginRight: 4 }} />
                      )}
                      <ThemedText type="small" themeColor="textSecondary">
                        {track.artist} • {Math.floor(track.duration / 60)}:{(track.duration % 60) < 10 ? '0' : ''}{track.duration % 60}
                      </ThemedText>
                    </View>
                  </View>
                  <Pressable style={styles.itemMoreBtn}>
                    <Icons.More size={20} color={theme.textSecondary} />
                  </Pressable>
                </Pressable>
              );
            })}
          </View>

          {/* SONGS SUBSECTION - SCREENSHOT 1 */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Songs</ThemedText>
              <Icons.ArrowRight size={20} color={theme.primary} />
            </View>

            {artistTracks.map((track) => {
              const isLiked = likes.includes(track.id);
              return (
                <Pressable 
                  key={`song-${track.id}`}
                  onPress={() => playTrack(track)}
                  style={styles.trackListItem}
                >
                  <Image source={{ uri: track.coverUrl }} style={styles.trackCover as any} />
                  <View style={styles.trackMeta}>
                    <ThemedText style={styles.trackName}>{track.title}</ThemedText>
                    <View style={styles.trackInfoSubtitle}>
                      {isLiked ? (
                        <Icons.Heart size={14} color="#E03B3B" fill="#E03B3B" style={{ marginRight: 4 }} />
                      ) : (
                        <Icons.CheckCircle size={14} color="#4CAF50" style={{ marginRight: 4 }} />
                      )}
                      <ThemedText type="small" themeColor="textSecondary">
                        {track.artist} • {Math.floor(track.duration / 60)}:{(track.duration % 60) < 10 ? '0' : ''}{track.duration % 60}
                      </ThemedText>
                    </View>
                  </View>
                  <Pressable style={styles.itemMoreBtn}>
                    <Icons.More size={20} color={theme.textSecondary} />
                  </Pressable>
                </Pressable>
              );
            })}
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
  scrollContent: {
    position: 'relative',
  },
  bannerContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerImage: {
    ...StyleSheet.absoluteFill,
  },
  bannerOverlayRed: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#8F302A', // Warm red base overlay color matching screenshot 1
    opacity: 0.15,
  },
  bannerOverlayFade: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 60%, rgba(255,248,246,1) 100%)',
    // Fallback for native formats using pure black transluscents
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  bannerNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    zIndex: 10,
  },
  floatingCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerArtistTitle: {
    position: 'absolute',
    bottom: Spacing.two,
    left: Spacing.three,
    fontSize: 52,
    fontWeight: '900',
    color: '#1C1A11',
    letterSpacing: 2,
  },
  buttonsDeck: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    marginVertical: Spacing.three,
    gap: Spacing.three,
    justifyContent: 'center',
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two - 2,
    paddingHorizontal: Spacing.five,
    borderRadius: 24,
    gap: Spacing.two,
    flex: 1,
    maxWidth: 180,
    elevation: 3,
  },
  shuffleBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
  radioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two - 2,
    paddingHorizontal: Spacing.five,
    borderRadius: 24,
    borderWidth: 1,
    gap: Spacing.two,
    flex: 1,
    maxWidth: 180,
  },
  radioBtnText: {
    fontWeight: '800',
    fontSize: 15,
  },
  sectionContainer: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5c3330', // Deep rose-red title
  },
  trackListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    gap: Spacing.two,
  },
  trackCover: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  trackMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  trackName: {
    fontWeight: '700',
    fontSize: 15,
  },
  trackInfoSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  itemMoreBtn: {
    padding: Spacing.two,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
