import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ScrollView, 
  Modal, 
  FlatList,
  Platform,
  Dimensions,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { usePlayer, Track } from '@/context/player-context';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons } from '@/components/icons';
import { Spacing } from '@/constants/theme';
import { ThemeAccent, ACCENT_PALETTES } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const PRESET_THEMES: { id: ThemeAccent; name: string; color: string }[] = [
  { id: 'rose', name: 'Samaa Rose', color: '#8F302A' },
  { id: 'teal', name: 'Mint Teal', color: '#006A5C' },
  { id: 'purple', name: 'Royal Purple', color: '#7E2A8F' },
  { id: 'indigo', name: 'Indigo Ocean', color: '#005FAF' },
  { id: 'slate', name: 'Charcoal Slate', color: '#4F5E70' },
  { id: 'amber', name: 'Forest Amber', color: '#785A00' },
  { id: 'amoled', name: 'AMOLED Dark', color: '#000000' }
];

export default function SearchScreen() {
  const { playTrack, likes, themeAccent, setThemeAccent, tracks, activeMode, addToQueue, searchNasheeds } = usePlayer();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
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

  const [recentSearchesNasheed, setRecentSearchesNasheed] = useState<string[]>([
    'Hasbi Rabbi',
    'Kun Anta',
    'Mawlaya'
  ]);

  const [recentSearchesQuran, setRecentSearchesQuran] = useState<string[]>([
    'Al-Fatiha',
    'Al-Mulk',
    'Ar-Rahman'
  ]);

  const recentSearches = activeMode === 'quran' ? recentSearchesQuran : recentSearchesNasheed;
  const setRecentSearches = activeMode === 'quran' ? setRecentSearchesQuran : setRecentSearchesNasheed;

  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);

  useEffect(() => {
    if (activeMode === 'quran') {
      const qFiltered = query.trim()
        ? tracks.filter(track => {
            const isQuranTrack = track.id.startsWith('quran_');
            if (!isQuranTrack) return false;
            
            return track.title.toLowerCase().includes(query.toLowerCase()) ||
                   track.artist.toLowerCase().includes(query.toLowerCase()) ||
                   track.album.toLowerCase().includes(query.toLowerCase());
          })
        : [];
      setFilteredTracks(qFiltered);
    } else {
      if (!query.trim()) {
        setFilteredTracks([]);
        return;
      }
      const delayDebounce = setTimeout(async () => {
        const results = await searchNasheeds(query);
        setFilteredTracks(results);
      }, 400);
      return () => clearTimeout(delayDebounce);
    }
  }, [query, activeMode, tracks]);

  const displayBrowseTracks = tracks.filter(track => {
    const isQuranTrack = track.id.startsWith('quran_');
    return activeMode === 'quran' ? isQuranTrack : !isQuranTrack;
  });

  const handleSearchSubmit = () => {
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]);
    }
  };

  const handleRecentPress = (item: string) => {
    setQuery(item);
  };

  const clearRecent = () => {
    setRecentSearches([]);
  };

  const renderTrackItem = ({ item }: { item: Track }) => {
    const isLiked = likes.includes(item.id);
    return (
      <Pressable 
        onPress={() => playTrack(item)}
        style={({ pressed }) => [
          styles.trackCard,
          { backgroundColor: theme.backgroundElement },
          pressed && { opacity: 0.8 }
        ]}
      >
        <Image source={{ uri: item.coverUrl }} style={styles.trackCover} />
        <View style={styles.trackMeta}>
          <ThemedText style={styles.trackTitle} numberOfLines={1}>{item.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {item.artist} • {item.album}
          </ThemedText>
        </View>
        <Pressable 
          onPress={(e) => {
            e.stopPropagation();
            addToQueue(item);
            triggerToast(`"${item.title}" added to queue`);
          }}
          style={({ pressed }) => [
            { padding: Spacing.two, borderRadius: 20 },
            pressed && { backgroundColor: theme.primary + '15' }
          ]}
        >
          <Icons.Queue size={20} color={theme.textSecondary} />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Top Header & Search Input Capsule */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + Spacing.two }]}>
        <View style={[styles.searchCapsule, { backgroundColor: theme.backgroundElement }]}>
          <Icons.Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder={activeMode === 'quran' ? "Search Surahs..." : "Search Nasheeds, artists..."}
            placeholderTextColor={`${theme.textSecondary}80`}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearchSubmit}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={styles.clearBtn}>
              <ThemedText style={{ color: theme.textSecondary, fontWeight: 'bold' }}>✕</ThemedText>
            </Pressable>
          )}
        </View>
        

      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {query.trim() === '' ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={styles.sectionTitle}>Recent Searches</ThemedText>
                  <Pressable onPress={clearRecent}>
                    <ThemedText type="small" style={{ color: theme.primary, fontWeight: 'bold' }}>Clear</ThemedText>
                  </Pressable>
                </View>
                <View style={styles.recentTags}>
                  {recentSearches.map((item, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => handleRecentPress(item)}
                      style={[styles.tagPill, { backgroundColor: theme.backgroundElement }]}
                    >
                      <Icons.History size={14} color={theme.textSecondary} />
                      <ThemedText type="small" style={{ color: theme.text }}>{item}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Popular Searches / Recommendations */}
            <View style={[styles.sectionContainer, { marginTop: Spacing.four }]}>
              <ThemedText style={styles.sectionTitle}>
                {activeMode === 'quran' ? "Browse Surahs" : "Browse All Tracks"}
              </ThemedText>
              <FlatList
                data={displayBrowseTracks}
                keyExtractor={(item) => item.id}
                renderItem={renderTrackItem}
                scrollEnabled={false}
                contentContainerStyle={{ gap: Spacing.two, marginTop: Spacing.two }}
              />
            </View>
          </>
        ) : (
          /* Search Results Listing */
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>
              Search Results ({filteredTracks.length})
            </ThemedText>
            {filteredTracks.length > 0 ? (
              <FlatList
                data={filteredTracks}
                keyExtractor={(item) => item.id}
                renderItem={renderTrackItem}
                scrollEnabled={false}
                contentContainerStyle={{ gap: Spacing.two, marginTop: Spacing.two }}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                  No tracks found for "{query}".
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Space for bottom floating player */}
        <View style={{ height: 160 }} />
      </ScrollView>



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

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  searchCapsule: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    padding: 0,
    height: '100%',
  },
  clearBtn: {
    padding: Spacing.one,
  },
  settingsBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  sectionContainer: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  recentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: 16,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: 16,
    gap: Spacing.two,
  },
  trackCover: {
    width: 46,
    height: 46,
    borderRadius: 8,
  },
  trackMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  trackTrailing: {
    paddingHorizontal: Spacing.one,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeDialog: {
    width: Dimensions.get('window').width * 0.85,
    borderRadius: 28,
    padding: Spacing.four,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  dialogSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: Spacing.three,
    lineHeight: 18,
  },
  themeListContainer: {
    width: '100%',
    marginBottom: Spacing.three,
  },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: 12,
    marginVertical: Spacing.one / 2,
    gap: Spacing.two,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  themeName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  dialogCloseBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  optionsDialogCard: {
    width: Dimensions.get('window').width * 0.88,
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
