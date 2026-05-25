import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Pressable, 
  TextInput,
  Modal,
  Animated
} from 'react-native';
import { Image } from 'expo-image';
import { usePlayer, Track } from '@/context/player-context';
import { AddToPlaylistModal } from '@/components/add-to-playlist-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

type FilterType = 'all' | 'vocal' | 'liked';

export default function SongsScreen() {
  const { tracks, likes, playTrack, toggleLike, addToQueue, likedTracks } = usePlayer();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
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

  // Filter logic
  const filteredTracks = activeFilter === 'liked'
    ? likedTracks.filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tracks.filter(track => {
        // 1. Filter by chip
        if (activeFilter === 'vocal' && track.album === 'Vocal Solitude') return true; // Muhammad al-Muqit's vocal focus
        if (activeFilter === 'vocal' && track.artist === 'Mishari Rashid Alafasy') return true; // Alafasy Vocal
        if (activeFilter === 'vocal') return false;

        // 2. Filter by search query
        return (
          track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.artist.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });

  const openOptions = (track: Track) => {
    setSelectedTrack(track);
    setShowOptionsModal(true);
  };

  const handleToggleLike = () => {
    if (selectedTrack) {
      toggleLike(selectedTrack);
      setShowOptionsModal(false);
    }
  };

  const handleAddToQueue = () => {
    if (selectedTrack) {
      addToQueue(selectedTrack);
      setShowOptionsModal(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: Spacing.three }]}>
          <ThemedText type="subtitle" style={styles.headerTitle}>All Nasheeds</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {filteredTracks.length} spiritual tracks
          </ThemedText>
        </View>

        {/* SEARCH DECK */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchCapsule, { backgroundColor: theme.backgroundElement }]}>
            <Icons.Search size={18} color={theme.textSecondary} style={styles.searchIcon} />
            <TextInput
              placeholder="Search by title or chanter..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* MATERIAL CHIP FILTERS */}
        <View style={styles.chipsRow}>
          <Pressable 
            onPress={() => setActiveFilter('all')}
            style={[
              styles.chip, 
              { backgroundColor: theme.backgroundElement },
              activeFilter === 'all' && { backgroundColor: theme.primary || '#8F302A' }
            ]}
          >
            <ThemedText 
              type="smallBold" 
              style={{ color: activeFilter === 'all' ? '#FFF' : theme.text }}
            >
              All
            </ThemedText>
          </Pressable>

          <Pressable 
            onPress={() => setActiveFilter('vocal')}
            style={[
              styles.chip, 
              { backgroundColor: theme.backgroundElement },
              activeFilter === 'vocal' && { backgroundColor: theme.primary || '#8F302A' }
            ]}
          >
            <ThemedText 
              type="smallBold" 
              style={{ color: activeFilter === 'vocal' ? '#FFF' : theme.text }}
            >
              Vocal Only
            </ThemedText>
          </Pressable>

          <Pressable 
            onPress={() => setActiveFilter('liked')}
            style={[
              styles.chip, 
              { backgroundColor: theme.backgroundElement },
              activeFilter === 'liked' && { backgroundColor: theme.primary || '#8F302A' }
            ]}
          >
            <ThemedText 
              type="smallBold" 
              style={{ color: activeFilter === 'liked' ? '#FFF' : theme.text }}
            >
              Favorites ({likes.length})
            </ThemedText>
          </Pressable>
        </View>

        {/* SONGS LIST */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {filteredTracks.length > 0 ? (
            filteredTracks.map(track => {
              const isLiked = likes.includes(track.id);
              return (
                <Pressable
                  key={track.id}
                  onPress={() => playTrack(track)}
                  style={({ pressed }) => [styles.songRow, pressed && styles.pressed]}
                >
                  <Image source={{ uri: track.coverUrl }} style={styles.songCover} transition={200} />
                  <View style={styles.songMeta}>
                    <ThemedText style={styles.songTitle}>{track.title}</ThemedText>
                    <View style={styles.songSubtitleRow}>
                      {isLiked && <Icons.Heart size={12} color="#E03B3B" fill="#E03B3B" style={{ marginRight: 4 }} />}
                      <ThemedText type="small" themeColor="textSecondary">
                        {track.artist} • {track.album}
                      </ThemedText>
                    </View>
                  </View>
                  <Pressable onPress={() => openOptions(track)} style={styles.moreBtn}>
                    <Icons.More size={20} color={theme.textSecondary} />
                  </Pressable>
                </Pressable>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Icons.Songs size={48} color={theme.textSecondary} style={{ marginBottom: Spacing.two }} />
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                No tracks found matching criteria.
              </ThemedText>
            </View>
          )}

          {/* Padding for bottom persistent players */}
          <View style={{ height: 160 }} />
        </ScrollView>

        {/* DIALOG OPTIONS DRAWER */}
        {showOptionsModal && (
          <Modal visible={true} transparent={true} animationType="slide" onRequestClose={() => setShowOptionsModal(false)}>
            <Pressable onPress={() => setShowOptionsModal(false)} style={styles.modalOverlay}>
              {selectedTrack && (
                <View style={[styles.optionsSheet, { backgroundColor: theme.backgroundElement }]}>
                  <View style={styles.optionsHeader}>
                    <Image source={{ uri: selectedTrack.coverUrl }} style={styles.optionsCover} />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={{ fontWeight: '800', fontSize: 16 }}>{selectedTrack.title}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">{selectedTrack.artist}</ThemedText>
                    </View>
                  </View>
  
                  <Pressable onPress={handleAddToQueue} style={styles.optionRow}>
                    <Icons.Queue size={22} color={theme.text} />
                    <ThemedText style={styles.optionText}>Add to Queue</ThemedText>
                  </Pressable>
  
                  <Pressable onPress={handleToggleLike} style={styles.optionRow}>
                    {likes.includes(selectedTrack.id) ? (
                      <>
                        <Icons.Heart size={22} color="#E03B3B" fill="#E03B3B" />
                        <ThemedText style={styles.optionText}>Remove from Favorites</ThemedText>
                      </>
                    ) : (
                      <>
                        <Icons.Heart size={22} color={theme.text} />
                        <ThemedText style={styles.optionText}>Add to Favorites</ThemedText>
                      </>
                    )}
                  </Pressable>
  
                  <Pressable 
                    onPress={() => {
                      setTrackForPlaylist(selectedTrack);
                      setShowOptionsModal(false);
                    }} 
                    style={styles.optionRow}
                  >
                    <Icons.AddPlaylist size={22} color={theme.text} />
                    <ThemedText style={styles.optionText}>Add to Playlist</ThemedText>
                  </Pressable>
  
                  <Pressable 
                    onPress={() => {
                      setShowOptionsModal(false);
                      // Navigate to dynamic artist detail!
                      router.push(`/artists/1`); // Redirect to featured artist showcase
                    }} 
                    style={styles.optionRow}
                  >
                    <Icons.Artists size={22} color={theme.text} />
                    <ThemedText style={styles.optionText}>View Artist Profile</ThemedText>
                  </Pressable>
  
                  <Pressable onPress={() => setShowOptionsModal(false)} style={styles.closeOptionBtn}>
                    <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>Close</ThemedText>
                  </Pressable>
                </View>
              )}
            </Pressable>
          </Modal>
        )}
        {/* PREMIUM ADD TO PLAYLIST MODAL */}
        <AddToPlaylistModal
          visible={trackForPlaylist !== null}
          track={trackForPlaylist}
          onClose={() => setTrackForPlaylist(null)}
          onAdded={(name) => triggerToast(`Added to playlist "${name}"`)}
        />

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
  searchContainer: {
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.two,
  },
  searchCapsule: {
    height: 44,
    borderRadius: 22,
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
    fontWeight: '500',
    padding: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    gap: Spacing.two,
  },
  songCover: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  songMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  songTitle: {
    fontWeight: '700',
    fontSize: 15,
  },
  songSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  moreBtn: {
    padding: Spacing.two,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  optionsSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.four,
  },
  optionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  optionsCover: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two + 4,
    gap: Spacing.three,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  closeOptionBtn: {
    alignItems: 'center',
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
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
