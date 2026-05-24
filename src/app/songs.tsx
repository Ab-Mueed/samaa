import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Pressable, 
  TextInput,
  Modal,
  SafeAreaView
} from 'react-native';
import { Image } from 'expo-image';
import { usePlayer, Track } from '@/context/player-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useRouter } from 'expo-router';

type FilterType = 'all' | 'vocal' | 'liked';

export default function SongsScreen() {
  const { tracks, likes, playTrack, toggleLike, addToQueue } = usePlayer();
  const theme = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  // Filter logic
  const filteredTracks = tracks.filter(track => {
    // 1. Filter by chip
    if (activeFilter === 'liked' && !likes.includes(track.id)) return false;
    if (activeFilter === 'vocal' && track.album === 'Vocal Solitude') return true; // Muhammad al-Muqit's vocal focus
    if (activeFilter === 'vocal' && track.artist === 'Mishari Rashid Alafasy') return true; // Alafasy Vocal

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
      toggleLike(selectedTrack.id);
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
        <View style={styles.header}>
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
        <Modal visible={showOptionsModal} transparent={true} animationType="slide">
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
});
