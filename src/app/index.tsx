import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Pressable, 
  TextInput, 
  Modal, 
  Dimensions, 
  SafeAreaView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { usePlayer, Track } from '@/context/player-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons } from '@/components/icons';
import { Spacing, MaxContentWidth, ThemeAccent } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    isSwitchingMode 
  } = usePlayer();
  
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');

  // Clear search query when mode changes
  useEffect(() => {
    setSearchQuery('');
  }, [activeMode]);

  // Filter tracks based on search query
  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <View style={[styles.searchContainer, { paddingTop: Math.max(Spacing.two, insets.top) }]}>
          <View style={[styles.searchCapsule, { backgroundColor: theme.backgroundElement }]}>
            <Icons.Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
            <TextInput
              placeholder={activeMode === 'quran' ? "Search Surahs..." : "Search Nasheeds..."}
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
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
                        <Image source={{ uri: reciter.avatarUrl }} style={styles.reciterAvatar} />
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
              {filteredTracks.length > 0 ? (
                filteredTracks.map(track => (
                  <Pressable 
                    key={track.id} 
                    onPress={() => playTrack(track)} 
                    style={({ pressed }) => [styles.trackListItem, pressed && styles.pressed]}
                  >
                    <Image source={{ uri: track.coverUrl }} style={styles.trackListCoverArt} />
                    <View style={styles.trackListMeta}>
                      <ThemedText style={styles.trackListName} numberOfLines={1}>{track.title}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>{track.artist}</ThemedText>
                    </View>
                    <Icons.Play size={18} color={theme.textSecondary} />
                  </Pressable>
                ))
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
                    <Image 
                      source={{ uri: track.coverUrl }} 
                      style={styles.trackListCoverArt} 
                      transition={250}
                    />
                    <View style={styles.trackListMeta}>
                      <ThemedText style={styles.trackListName} numberOfLines={1}>{track.title}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>{track.artist}</ThemedText>
                    </View>
                    <Icons.More size={20} color={theme.textSecondary} />
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
                      <Image 
                        source={{ uri: track.coverUrl }} 
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
              <ActivityIndicator size="large" color={theme.primary} />
              <ThemedText style={[styles.loadingText, { color: theme.text, marginTop: Spacing.two }]}>
                {activeMode === 'quran' ? "Loading Quran Audio API..." : "Loading Nasheeds Sandbox..."}
              </ThemedText>
            </View>
          </View>
        )}



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
    padding: Spacing.four,
    borderRadius: 24,
    alignItems: 'center',
    width: 260,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
});
