import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Pressable, 
  TextInput, 
  Modal, 
  Dimensions, 
  Platform,
  Animated,
  Easing,
  ActivityIndicator
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { usePlayer, Track } from '@/context/player-context';
import { AddToPlaylistModal } from '@/components/add-to-playlist-modal';
import { TrackImage } from '@/components/track-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons } from '@/components/icons';
import { Spacing, MaxContentWidth, ThemeAccent } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const { 
    tracks, 
    playTrack, 
    history, 
    likes, 
    clearHistory, 
    activeMode, 
    setActiveMode, 
    activeReciter, 
    setActiveReciter, 
    quranReciters, 
    isSwitchingMode,
    addToQueue,
    searchNasheeds,
    toggleLike,
    likedTracks
  } = usePlayer();
  
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [trackForPlaylist, setTrackForPlaylist] = useState<Track | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const triggerToast = (message: string) => {
    setToastMessage(message);
    toastOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.delay(1600),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      })
    ]).start(() => {
      setToastMessage(null);
    });
  };

  // Rotating loop for the custom starburst spinner
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSwitchingMode) {
      spinAnim.setValue(0);
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isSwitchingMode]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Clear search query when mode changes
  useEffect(() => {
    setSearchQuery('');
  }, [activeMode]);

  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (activeMode === 'quran') {
      setIsSearching(false);
      const qFiltered = searchQuery.trim()
        ? tracks.filter(t => 
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.album.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : [];
      setFilteredTracks(qFiltered);
    } else {
      if (!searchQuery.trim()) {
        setFilteredTracks([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      const delayDebounce = setTimeout(async () => {
        try {
          const results = await searchNasheeds(searchQuery);
          setFilteredTracks(results);
        } finally {
          setIsSearching(false);
        }
      }, 400);
      return () => clearTimeout(delayDebounce);
    }
  }, [searchQuery, activeMode, tracks]);

  // Generate random track for shuffle play
  const playRandomTrack = () => {
    if (tracks.length === 0) return;
    const randomIndex = Math.floor(Math.random() * tracks.length);
    playTrack(tracks[randomIndex]);
  };



  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* CAPSULE SEARCH BAR */}
        <View style={[styles.searchContainer, { paddingTop: Spacing.two }]}>
          <View style={[styles.searchCapsule, { backgroundColor: theme.backgroundElement }]}>
            <Icons.Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
            <TextInput
              placeholder={activeMode === 'quran' ? "Search Surahs..." : "Search Nasheeds..."}
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (activeMode === 'nasheed') {
                  setIsSearching(text.trim().length > 0);
                }
              }}
            />
            <Pressable 
              onPress={playRandomTrack} 
              style={({ pressed }) => [
                styles.searchSettingsBtn,
                { marginRight: Spacing.two },
                pressed && { opacity: 0.6 }
              ]}
            >
              <Icons.Shuffle size={20} color={theme.textSecondary} />
            </Pressable>
            <Pressable onPress={() => router.push('/settings')} style={styles.searchSettingsBtn}>
              <Icons.Settings size={20} color={theme.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* MODAL SWITCHER - SEGMENTED BAR */}
        <View style={styles.modeSwitcherContainer}>
          <View style={[styles.modeSwitcherCapsule, { backgroundColor: theme.backgroundElement }]}>
            <Pressable 
              onPress={() => setActiveMode('quran')}
              style={[
                styles.modeOption, 
                activeMode === 'quran' && { backgroundColor: theme.primary }
              ]}
            >
              <Icons.Book 
                size={16} 
                color={activeMode === 'quran' ? (theme.onPrimary || '#FFFFFF') : theme.textSecondary} 
                style={{ marginRight: Spacing.one }}
              />
              <ThemedText 
                style={[
                  styles.modeText, 
                  activeMode === 'quran' && { color: theme.onPrimary || '#FFFFFF', fontWeight: 'bold' }
                ]}
              >
                Quran Recitation
              </ThemedText>
            </Pressable>

            <Pressable 
              onPress={() => setActiveMode('nasheed')}
              style={[
                styles.modeOption, 
                activeMode === 'nasheed' && { backgroundColor: theme.primary }
              ]}
            >
              <Icons.Songs 
                size={16} 
                color={activeMode === 'nasheed' ? (theme.onPrimary || '#FFFFFF') : theme.textSecondary} 
                style={{ marginRight: Spacing.one }}
              />
              <ThemedText 
                style={[
                  styles.modeText, 
                  activeMode === 'nasheed' && { color: theme.onPrimary || '#FFFFFF', fontWeight: 'bold' }
                ]}
              >
                Vocal Nasheed
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* DYNAMIC RECITER SELECTOR (ONLY FOR QURAN MODE) */}
          {activeMode === 'quran' && (
            <View style={styles.reciterSection}>
              <ThemedText style={[styles.sectionTitle, { color: theme.primary, marginBottom: Spacing.two }]}>
                Choose Reciter
              </ThemedText>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.reciterRow}
              >
                {quranReciters.map((reciter) => {
                  const isActive = activeReciter.id === reciter.id;
                  return (
                    <Pressable
                      key={reciter.id}
                      onPress={() => setActiveReciter(reciter)}
                      style={styles.reciterItem}
                    >
                      <View style={[
                        styles.reciterAvatarWrapper,
                        isActive && { borderColor: theme.primary, borderWidth: 2 }
                      ]}>
                        <Image source={typeof reciter.avatarUrl === 'string' ? { uri: reciter.avatarUrl } : reciter.avatarUrl} style={styles.reciterAvatar} />
                      </View>
                      <ThemedText 
                        numberOfLines={1} 
                        style={[
                          styles.reciterNameText,
                          isActive && { color: theme.primary, fontWeight: 'bold' }
                        ]}
                      >
                        {reciter.name.split(' ').pop()}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}



          {/* SEARCH RESULTS OR QUICK PICKS */}
          {searchQuery.length > 0 ? (
            <View style={styles.sectionContainer}>
              <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>Search Results</ThemedText>
              {isSearching ? (
                <View style={{ paddingVertical: Spacing.four, alignItems: 'center', gap: Spacing.two }}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <ThemedText type="small" themeColor="textSecondary">Searching YouTube...</ThemedText>
                </View>
              ) : filteredTracks.length > 0 ? (
                filteredTracks.map(track => {
                  const isLiked = likes.includes(track.id);
                  return (
                    <Pressable 
                      key={track.id} 
                      onPress={() => playTrack(track)} 
                      style={({ pressed }) => [styles.trackListItem, pressed && styles.pressed]}
                    >
                      <TrackImage track={track} style={styles.trackListCoverArt} />
                      <View style={styles.trackListMeta}>
                        <ThemedText style={styles.trackListName} numberOfLines={1}>{track.title}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>{track.artist}</ThemedText>
                      </View>
                      <View style={{ flexDirection: 'row', gap: Spacing.one }}>
                        <Pressable 
                          onPress={(e) => {
                            e.stopPropagation();
                            toggleLike(track);
                            triggerToast(likes.includes(track.id) ? `Removed from Favorites` : `Added to Favorites`);
                          }}
                          style={({ pressed }) => [
                            { padding: Spacing.two, borderRadius: 20 },
                            pressed && { backgroundColor: theme.primary + '15' }
                          ]}
                        >
                          <Icons.Heart 
                            size={20} 
                            color={isLiked ? "#E03B3B" : theme.textSecondary} 
                            fill={isLiked ? "#E03B3B" : "transparent"}
                          />
                        </Pressable>
                        <Pressable 
                          onPress={(e) => {
                            e.stopPropagation();
                            setTrackForPlaylist(track);
                          }}
                          style={({ pressed }) => [
                            { padding: Spacing.two, borderRadius: 20 },
                            pressed && { backgroundColor: theme.primary + '15' }
                          ]}
                        >
                          <Icons.AddPlaylist size={20} color={theme.textSecondary} />
                        </Pressable>
                        <Pressable 
                          onPress={(e) => {
                            e.stopPropagation();
                            addToQueue(track);
                            triggerToast(`"${track.title}" added to queue`);
                          }}
                          style={({ pressed }) => [
                            { padding: Spacing.two, borderRadius: 20 },
                            pressed && { backgroundColor: theme.primary + '15' }
                          ]}
                        >
                          <Icons.Queue size={20} color={theme.textSecondary} />
                        </Pressable>
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <ThemedText themeColor="textSecondary" style={styles.emptyText}>No results found.</ThemedText>
              )}
            </View>
          ) : (
            <>
              {/* QUICK PICKS Section */}
              <View style={styles.sectionContainer}>
                <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>
                  {activeMode === 'quran' ? "Selected Surahs" : "Quick picks"}
                </ThemedText>
                
                {tracks.slice(0, 4).map(track => (
                  <Pressable 
                    key={track.id} 
                    onPress={() => playTrack(track)} 
                    style={({ pressed }) => [styles.trackListItem, pressed && styles.pressed]}
                  >
                    <TrackImage 
                      track={track} 
                      style={styles.trackListCoverArt} 
                      transition={250}
                    />
                    <View style={styles.trackListMeta}>
                      <ThemedText style={styles.trackListName} numberOfLines={1}>{track.title}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>{track.artist}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', gap: Spacing.one }}>
                      <Pressable 
                        onPress={(e) => {
                          e.stopPropagation();
                          setTrackForPlaylist(track);
                        }}
                        style={({ pressed }) => [
                          { padding: Spacing.two, borderRadius: 20 },
                          pressed && { backgroundColor: theme.primary + '15' }
                        ]}
                      >
                        <Icons.AddPlaylist size={20} color={theme.textSecondary} />
                      </Pressable>
                      <Pressable 
                        onPress={(e) => {
                          e.stopPropagation();
                          addToQueue(track);
                          triggerToast(`"${track.title}" added to queue`);
                        }}
                        style={({ pressed }) => [
                          { padding: Spacing.two, borderRadius: 20 },
                          pressed && { backgroundColor: theme.primary + '15' }
                        ]}
                      >
                        <Icons.Queue size={20} color={theme.textSecondary} />
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
              </View>

              {/* KEEP LISTENING (Horizontal Cards list) */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <ThemedText style={[styles.sectionTitle, { color: theme.primary, marginBottom: 2 }]}>
                      {activeMode === 'quran' ? "Browse all surahs" : "Keep listening"}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {activeMode === 'quran' ? `Beautiful recitations by Sheikh ${activeReciter.name.split(' ').pop()}` : "Beautiful spiritual vocal harmonies"}
                    </ThemedText>
                  </View>
                </View>

                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContent}
                >
                  {tracks.slice(activeMode === 'quran' ? 0 : 0).map(track => (
                    <Pressable 
                      key={track.id}
                      onPress={() => playTrack(track)}
                      style={({ pressed }) => [styles.cardContainer, pressed && styles.pressed]}
                    >
                      <TrackImage 
                        track={track} 
                        style={styles.cardImage} 
                        transition={300}
                      />
                      <ThemedText numberOfLines={1} style={styles.cardTitle}>{track.title.split(' (')[0]}</ThemedText>
                      <ThemedText numberOfLines={1} type="small" themeColor="textSecondary" style={styles.cardSubtitle}>
                        {activeMode === 'quran' ? `${track.album}` : `${track.artist}`}
                      </ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </>
          )}

          {/* Spacer padding for bottom floating player */}
          <View style={{ height: 160 }} />

        </ScrollView>

        {/* MATERIAL UI DUAL-MODE LOADING SPINNER OVERLAY */}
        {isSwitchingMode && (
          <View style={styles.loadingSpinnerContainer}>
            <View style={[styles.loadingSpinnerCard, { backgroundColor: theme.backgroundElement }]}>
              {/* Outer halo background circle */}
              <View style={[styles.spinnerHalo, { backgroundColor: theme.primary + '20' }]}>
                {/* Rotating custom starburst scallop SVG */}
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Svg width={44} height={44} viewBox="0 0 48 48">
                    <Path 
                      d="M24,4 C26.2,4 27.1,6.5 29.1,7.5 C31.1,8.5 33.6,8.2 35.1,9.9 C36.6,11.6 36.0,14.1 37.0,16.1 C38.0,18.1 40.5,19.3 40.5,21.5 C40.5,23.7 38.0,24.9 37.0,26.9 C36.0,28.9 36.6,31.4 35.1,33.1 C33.6,34.8 31.1,34.5 29.1,35.5 C27.1,36.5 26.2,39.0 24,39.0 C21.8,39.0 20.9,36.5 18.9,35.5 C16.9,34.5 14.4,34.8 12.9,33.1 C11.4,31.4 12.0,28.9 11.0,26.9 C10.0,24.9 7.5,23.7 7.5,21.5 C7.5,19.3 10.0,18.1 11.0,16.1 C12.0,14.1 11.4,11.6 12.9,9.9 C14.4,8.2 16.9,8.5 18.9,7.5 C20.9,6.5 21.8,4 24,4 Z" 
                      fill={theme.primary} 
                    />
                  </Svg>
                </Animated.View>
              </View>
            </View>
          </View>
        )}



        {/* PREMIUM FLOAT TOAST */}
        {toastMessage && (
          <Animated.View style={[
            styles.toastContainer, 
            { 
              opacity: toastOpacity, 
              backgroundColor: theme.primary,
              transform: [{
                translateY: toastOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }
          ]}>
            <Icons.Checked size={16} color={theme.onPrimary || '#FFFFFF'} style={{ marginRight: 8 }} />
            <ThemedText style={{ color: theme.onPrimary || '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>
              {toastMessage}
            </ThemedText>
          </Animated.View>
        )}

        {/* PREMIUM ADD TO PLAYLIST MODAL */}
        <AddToPlaylistModal
          visible={trackForPlaylist !== null}
          track={trackForPlaylist}
          onClose={() => setTrackForPlaylist(null)}
          onAdded={(name) => triggerToast(`Added to playlist "${name}"`)}
        />

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
    position: 'relative',
  },
  searchContainer: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  searchCapsule: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  searchSettingsBtn: {
    padding: Spacing.one,
  },
  modeSwitcherContainer: {
    paddingHorizontal: Spacing.three,
    marginVertical: Spacing.two,
    alignItems: 'center',
  },
  modeSwitcherCapsule: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 25,
    padding: 4,
    width: '100%',
    maxWidth: 360,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  modeOption: {
    flex: 1,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reciterSection: {
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
  reciterRow: {
    paddingHorizontal: 0,
    gap: Spacing.two,
  },
  reciterItem: {
    alignItems: 'center',
    width: 72,
  },
  reciterAvatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 2,
    borderColor: 'transparent',
    borderWidth: 2,
    overflow: 'hidden',
  },
  reciterAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  reciterNameText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.one,
  },

  sectionContainer: {
    marginTop: Spacing.three,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  trackListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    gap: Spacing.two,
  },
  trackListCoverArt: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  trackListMeta: {
    flex: 1,
  },
  trackListName: {
    fontWeight: '700',
    fontSize: 15,
  },
  horizontalScrollContent: {
    paddingRight: Spacing.four,
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  cardContainer: {
    width: 140,
  },
  cardImage: {
    width: 140,
    height: 140,
    borderRadius: 16,
    marginBottom: Spacing.one,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Spacing.three,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.65,
  },
  loadingSpinnerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  loadingSpinnerCard: {
    width: 90,
    height: 90,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  spinnerHalo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  optionsDialogCard: {
    width: SCREEN_WIDTH * 0.88,
    borderRadius: 28,
    padding: Spacing.four,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    alignSelf: 'center',
  },
  optionsDialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  optionsCoverArt: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  optionsTrackTitle: {
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 2,
  },
  optionsRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: 16,
    marginVertical: Spacing.one / 2,
    gap: Spacing.three,
  },
  optionsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsRowText: {
    fontWeight: '700',
    fontSize: 15,
  },
  optionsCloseBtn: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: 20,
    marginTop: Spacing.two,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 156, // nested comfortably above floating mini-player!
    left: '10%',
    right: '10%',
    borderRadius: 24,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    zIndex: 3000,
  },
});
