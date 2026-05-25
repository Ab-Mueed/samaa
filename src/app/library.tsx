import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Modal, 
  TextInput,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { usePlayer, Track } from '@/context/player-context';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons } from '@/components/icons';
import { Spacing } from '@/constants/theme';

interface CustomPlaylist {
  id: string;
  name: string;
  tracks: Track[];
}

export default function LibraryScreen() {
  const { 
    tracks, 
    likedTracks, 
    history, 
    playTrack, 
    playAll, 
    activeMode,
    playlists,
    createPlaylist,
    removeTrackFromPlaylist,
    toggleLike
  } = usePlayer();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [showLikedSongsModal, setShowLikedSongsModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<CustomPlaylist | null>(null);
  
  // Extract history tracks
  const historyTracks = history.map(id => tracks.find(t => t.id === id)).filter((t): t is Track => !!t);



  const handleCreatePlaylist = () => {
    if (playlistName.trim().length === 0) return;
    createPlaylist(playlistName.trim());
    setPlaylistName('');
    setShowCreateModal(false);
  };



  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <View style={[styles.header, { paddingTop: Spacing.three }]}>
          <ThemedText style={styles.headerTitle}>{activeMode === 'quran' ? 'Quran Library' : 'Nasheed Library'}</ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* PLAYLISTS SECTION */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Playlists</ThemedText>
              <Pressable 
                onPress={() => setShowCreateModal(true)} 
                style={({ pressed }) => [styles.createPillBtn, { backgroundColor: theme.backgroundElement }, pressed && { opacity: 0.8 }]}
              >
                <Icons.AddPlaylist size={18} color={theme.primary} />
                <ThemedText type="small" style={{ color: theme.primary, fontWeight: 'bold' }}>Create</ThemedText>
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playlistsScroll}>
              {/* Favorites Playlist Card */}
              <Pressable 
                onPress={() => setShowLikedSongsModal(true)}
                style={({ pressed }) => [
                  styles.playlistCard, 
                  { backgroundColor: theme.backgroundElement }, 
                  pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 }
                ]}
              >
                {likedTracks.length > 0 ? (
                  <Image source={{ uri: likedTracks[0].coverUrl }} style={styles.playlistArt} />
                ) : (
                  <View style={[styles.likedSongsIconContainer, { backgroundColor: theme.primary }]}>
                    <Icons.Heart size={26} color="#FFFFFF" fill="#FFFFFF" />
                  </View>
                )}
                <ThemedText style={styles.playlistName} numberOfLines={1}>Favorites</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">{likedTracks.length} items</ThemedText>
              </Pressable>

              {/* Custom Playlists */}
              {playlists.map((playlist) => (
                <Pressable 
                  key={playlist.id}
                  onPress={() => setSelectedPlaylist(playlist)}
                  style={({ pressed }) => [styles.playlistCard, { backgroundColor: theme.backgroundElement }, pressed && { opacity: 0.8 }]}
                >
                  {playlist.tracks.length > 0 ? (
                    <Image source={{ uri: playlist.tracks[0].coverUrl }} style={styles.playlistArt} />
                  ) : (
                    <View style={[styles.likedSongsIconContainer, { backgroundColor: theme.outline }]}>
                      <Icons.Songs size={24} color="#FFFFFF" />
                    </View>
                  )}
                  <ThemedText style={styles.playlistName} numberOfLines={1}>{playlist.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">{playlist.tracks.length} items</ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* HISTORY SECTION */}
          {historyTracks.length > 0 && (
            <View style={[styles.sectionContainer, { marginTop: Spacing.four }]}>
              <ThemedText style={styles.sectionTitle}>Recently Played</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyScroll}>
                {historyTracks.map((track, i) => (
                  <Pressable
                    key={`${track.id}-${i}`}
                    onPress={() => playTrack(track)}
                    style={({ pressed }) => [styles.historyCard, pressed && { opacity: 0.8 }]}
                  >
                    <Image source={{ uri: track.coverUrl }} style={styles.historyArt} />
                    <ThemedText style={styles.historyTitle} numberOfLines={1}>{track.title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>{track.artist}</ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}



          {/* Padding for bottom player */}
          <View style={{ height: 160 }} />
        </ScrollView>

        {/* DIALOG POPUP: LIKED SONGS VIEW */}
        {showLikedSongsModal && (
          <Modal 
            visible={true} 
            transparent={true} 
            animationType="slide" 
            onRequestClose={() => setShowLikedSongsModal(false)}
          >
            <Pressable onPress={() => setShowLikedSongsModal(false)} style={[styles.modalOverlay, { justifyContent: 'flex-end', alignItems: 'stretch' }]}>
              <View style={[styles.likedSongsSheet, { backgroundColor: theme.background }]}>
                <View style={styles.sheetHeader}>
                  <ThemedText style={styles.sheetTitle}>Favorites</ThemedText>
                  <Pressable onPress={() => setShowLikedSongsModal(false)} style={styles.closeTextBtn}>
                    <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>Close</ThemedText>
                  </Pressable>
                </View>
                
                {likedTracks.length > 0 && (
                  <Pressable 
                    onPress={() => {
                      playAll(likedTracks, 0);
                      setShowLikedSongsModal(false);
                    }}
                    style={({ pressed }) => [
                      styles.playAllBtn, 
                      { backgroundColor: theme.primary },
                      pressed && { opacity: 0.8 }
                    ]}
                  >
                    <Icons.Play size={18} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 6 }} />
                    <ThemedText style={styles.playAllText}>Play All</ThemedText>
                  </Pressable>
                )}
                
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                  {likedTracks.length > 0 ? (
                    likedTracks.map((track, idx) => (
                      <Pressable
                        key={track.id}
                        onPress={() => {
                          playAll(likedTracks, idx);
                          setShowLikedSongsModal(false);
                        }}
                        style={({ pressed }) => [
                          styles.trackListItem,
                          pressed && { backgroundColor: theme.backgroundSelected || 'rgba(0,0,0,0.04)' }
                        ]}
                      >
                        <Image source={{ uri: track.coverUrl }} style={styles.trackListCoverArt} />
                        <View style={styles.trackListMeta}>
                          <ThemedText style={styles.trackListName}>{track.title}</ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">{track.artist}</ThemedText>
                        </View>
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            toggleLike(track);
                          }}
                          style={{ padding: Spacing.two }}
                        >
                          <Icons.Heart size={18} color="#E03B3B" fill="#E03B3B" />
                        </Pressable>
                      </Pressable>
                    ))
                  ) : (
                    <ThemedText themeColor="textSecondary" style={styles.emptyHistoryText}>
                      No liked Nasheeds yet. Tap the heart on songs to add them!
                    </ThemedText>
                  )}
                </ScrollView>
              </View>
            </Pressable>
          </Modal>
        )}

        {/* DIALOG POPUP: CUSTOM PLAYLIST DETAILED SHEET */}
        {selectedPlaylist && (
          <Modal 
            visible={true} 
            transparent={true} 
            animationType="slide" 
            onRequestClose={() => setSelectedPlaylist(null)}
          >
            <Pressable onPress={() => setSelectedPlaylist(null)} style={[styles.modalOverlay, { justifyContent: 'flex-end', alignItems: 'stretch' }]}>
              <View style={[styles.likedSongsSheet, { backgroundColor: theme.background }]}>
                <View style={styles.sheetHeader}>
                  <ThemedText style={styles.sheetTitle}>{selectedPlaylist.name}</ThemedText>
                  <Pressable onPress={() => setSelectedPlaylist(null)} style={styles.closeTextBtn}>
                    <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>Close</ThemedText>
                  </Pressable>
                </View>

                {selectedPlaylist.tracks.length > 0 && (
                  <Pressable 
                    onPress={() => {
                      playAll(selectedPlaylist.tracks, 0);
                      setSelectedPlaylist(null);
                    }}
                    style={({ pressed }) => [
                      styles.playAllBtn, 
                      { backgroundColor: theme.primary },
                      pressed && { opacity: 0.8 }
                    ]}
                  >
                    <Icons.Play size={18} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 6 }} />
                    <ThemedText style={styles.playAllText}>Play All</ThemedText>
                  </Pressable>
                )}
                
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                  {selectedPlaylist.tracks.length > 0 ? (
                    selectedPlaylist.tracks.map((track, index) => (
                      <Pressable
                        key={track.id}
                        onPress={() => {
                          playAll(selectedPlaylist.tracks, index);
                          setSelectedPlaylist(null);
                        }}
                        style={({ pressed }) => [
                          styles.trackListItem,
                          pressed && { backgroundColor: theme.backgroundSelected || 'rgba(0,0,0,0.04)' }
                        ]}
                      >
                        <Image source={{ uri: track.coverUrl }} style={styles.trackListCoverArt} />
                        <View style={styles.trackListMeta}>
                          <ThemedText style={styles.trackListName}>{track.title}</ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">{track.artist}</ThemedText>
                        </View>
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            removeTrackFromPlaylist(selectedPlaylist.id, track.id);
                            setSelectedPlaylist(prev => prev ? {
                              ...prev,
                              tracks: prev.tracks.filter(t => t.id !== track.id)
                            } : null);
                          }}
                          style={{ padding: Spacing.two }}
                        >
                          <ThemedText style={{ color: '#E03B3B', fontSize: 18, fontWeight: 'bold' }}>✕</ThemedText>
                        </Pressable>
                      </Pressable>
                    ))
                  ) : (
                    <ThemedText themeColor="textSecondary" style={styles.emptyHistoryText}>
                      No tracks in this playlist yet. Add tracks from Search or Chanter listings!
                    </ThemedText>
                  )}
                </ScrollView>
              </View>
            </Pressable>
          </Modal>
        )}

        {/* DIALOG POPUP: CREATE PLAYLIST */}
        {showCreateModal && (
          <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setShowCreateModal(false)}>
            <Pressable onPress={() => setShowCreateModal(false)} style={styles.modalOverlay}>
              <View style={[styles.createDialog, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText style={styles.dialogTitle}>Create Playlist</ThemedText>
                
                <TextInput
                  placeholder="Enter playlist name..."
                  placeholderTextColor={theme.textSecondary}
                  value={playlistName}
                  onChangeText={setPlaylistName}
                  autoFocus={true}
                  style={[styles.dialogInput, { color: theme.text, borderBottomColor: theme.outline }]}
                />

                <View style={styles.dialogButtonsRow}>
                  <Pressable onPress={() => setShowCreateModal(false)} style={styles.dialogBtn}>
                    <ThemedText themeColor="textSecondary">Cancel</ThemedText>
                  </Pressable>
                  <Pressable onPress={handleCreatePlaylist} style={styles.dialogBtn}>
                    <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>Create</ThemedText>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </Modal>
        )}

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
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
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.two,
  },
  createPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
  },
  playlistsScroll: {
    gap: Spacing.three,
    paddingRight: Spacing.four,
  },
  playlistCard: {
    width: 120,
    padding: Spacing.two,
    borderRadius: 20,
  },
  likedSongsIconContainer: {
    width: 104,
    height: 104,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistArt: {
    width: 104,
    height: 104,
    borderRadius: 16,
  },
  playlistName: {
    fontWeight: '700',
    fontSize: 14,
    marginTop: Spacing.one,
  },
  historyScroll: {
    gap: Spacing.three,
  },
  historyCard: {
    width: 100,
  },
  historyArt: {
    width: 100,
    height: 100,
    borderRadius: 16,
    marginBottom: Spacing.one,
  },
  historyTitle: {
    fontWeight: '700',
    fontSize: 13,
  },
  // Removed duplicate Favorites styles to keep layout clean
  artistsScroll: {
    gap: Spacing.three,
  },
  artistCard: {
    width: 90,
    alignItems: 'center',
  },
  artistArt: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.one,
  },
  artistNameText: {
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createDialog: {
    width: Dimensions.get('window').width * 0.85,
    borderRadius: 28,
    padding: Spacing.four,
    elevation: 24,
  },
  dialogTitle: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  dialogInput: {
    borderBottomWidth: 1.5,
    paddingVertical: Spacing.one,
    fontSize: 15,
    marginBottom: Spacing.four,
  },
  dialogButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.four,
  },
  dialogBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  likedSongsSheet: {
    height: Dimensions.get('window').height * 0.65,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.three,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  sheetTitle: {
    fontWeight: '800',
    fontSize: 18,
  },
  closeTextBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  trackListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: 12,
    marginVertical: Spacing.one / 2,
    gap: Spacing.two,
  },
  trackListCoverArt: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  trackListMeta: {
    flex: 1,
  },
  trackListName: {
    fontWeight: '700',
    fontSize: 15,
  },
  emptyHistoryText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    paddingHorizontal: Spacing.four,
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderRadius: 20,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  playAllText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
