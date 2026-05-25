import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Pressable,
  Modal,
  TextInput
} from 'react-native';
import { Image } from 'expo-image';
import { usePlayer, Track } from '@/context/player-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

interface CustomPlaylist {
  id: string;
  name: string;
  tracks: Track[];
}

export default function PlaylistsScreen() {
  const { tracks, likedTracks, history, playAll } = usePlayer();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [playlists, setPlaylists] = useState<CustomPlaylist[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  
  // Extract history tracks
  const historyTracks = history.map(id => tracks.find(t => t.id === id)).filter((t): t is Track => !!t);

  const handleCreatePlaylist = () => {
    if (playlistName.trim().length === 0) return;

    // Create a new mock playlist with 2 random songs for demonstration purposes!
    const randomTracks = [...tracks].sort(() => Math.random() - 0.5).slice(0, 2);

    const newPlaylist: CustomPlaylist = {
      id: Date.now().toString(),
      name: playlistName,
      tracks: randomTracks
    };

    setPlaylists([...playlists, newPlaylist]);
    setPlaylistName('');
    setShowCreateModal(false);
  };

  const playPlaylist = (trackList: Track[]) => {
    if (trackList.length > 0) {
      playAll(trackList, 0);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: Spacing.three }]}>
          <ThemedText type="subtitle" style={styles.headerTitle}>Spiritual Playlists</ThemedText>
          <Pressable 
            onPress={() => setShowCreateModal(true)} 
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
          >
            <Icons.AddPlaylist size={26} color={theme.primary || '#8F302A'} />
          </Pressable>
        </View>

        {/* PLAYLISTS LIST */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* FAVORITES (DYNAMIC SYSTEM CARD) */}
          <Pressable
            onPress={() => playPlaylist(likedTracks)}
            style={({ pressed }) => [styles.playlistCard, pressed && styles.pressed]}
          >
            <View style={[styles.cardArtWrapper, { backgroundColor: '#E03B3B20' }]}>
              <Icons.Heart size={36} color="#E03B3B" fill="#E03B3B" />
            </View>
            <View style={styles.playlistMeta}>
              <ThemedText style={styles.playlistTitleText}>Favorites</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                System Playlist • {likedTracks.length} liked {likedTracks.length === 1 ? 'track' : 'tracks'}
              </ThemedText>
            </View>
            <Icons.Play size={20} color={theme.textSecondary} />
          </Pressable>

          {/* RECENTLY PLAYED (DYNAMIC SYSTEM CARD) */}
          <Pressable
            onPress={() => playPlaylist(historyTracks)}
            style={({ pressed }) => [styles.playlistCard, pressed && styles.pressed]}
          >
            <View style={[styles.cardArtWrapper, { backgroundColor: '#0288D120' }]}>
              <Icons.History size={36} color="#0288D1" />
            </View>
            <View style={styles.playlistMeta}>
              <ThemedText style={styles.playlistTitleText}>Recently Played</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                System Playlist • {historyTracks.length} recently played
              </ThemedText>
            </View>
            <Icons.Play size={20} color={theme.textSecondary} />
          </Pressable>

          {/* CUSTOM USER PLAYLISTS */}
          {playlists.length > 0 && (
            <View style={styles.customPlaylistsHeader}>
              <ThemedText style={styles.customSectionTitle}>Custom Playlists</ThemedText>
            </View>
          )}

          {playlists.map((pl) => (
            <Pressable
              key={pl.id}
              onPress={() => playPlaylist(pl.tracks)}
              style={({ pressed }) => [styles.playlistCard, pressed && styles.pressed]}
            >
              <View style={[styles.cardArtWrapper, { backgroundColor: theme.backgroundElement }]}>
                <Icons.Playlists size={36} color={theme.primary || '#8F302A'} />
              </View>
              <View style={styles.playlistMeta}>
                <ThemedText style={styles.playlistTitleText}>{pl.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Custom Playlist • {pl.tracks.length} tracks
                </ThemedText>
              </View>
              <Icons.Play size={20} color={theme.textSecondary} />
            </Pressable>
          ))}

          {playlists.length === 0 && likedTracks.length === 0 && historyTracks.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icons.Playlists size={56} color={theme.textSecondary} style={{ marginBottom: Spacing.two }} />
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                No playlists in your library. Add favorite tracks or create a new playlist!
              </ThemedText>
            </View>
          )}

          {/* Padding for bottom floating player overlay */}
          <View style={{ height: 160 }} />
        </ScrollView>

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
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 28,
  },
  addBtn: {
    padding: Spacing.two,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.one,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    gap: Spacing.three,
  },
  cardArtWrapper: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  playlistTitleText: {
    fontWeight: '800',
    fontSize: 16,
  },
  customPlaylistsHeader: {
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
    paddingBottom: Spacing.one,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  customSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0288D1',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: Spacing.four,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createDialog: {
    width: 280,
    borderRadius: 28,
    padding: Spacing.four,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  dialogTitle: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  dialogInput: {
    fontSize: 15,
    paddingVertical: Spacing.one,
    borderBottomWidth: 1,
    marginBottom: Spacing.three,
  },
  dialogButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.three,
  },
  dialogBtn: {
    padding: Spacing.two,
  },
});
