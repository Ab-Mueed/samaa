import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  Pressable, 
  ScrollView, 
  TextInput, 
  Dimensions, 
  Platform 
} from 'react-native';
import { usePlayer, Track } from '@/context/player-context';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';
import { Icons } from '@/components/icons';
import { Spacing } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddToPlaylistModalProps {
  visible: boolean;
  track: Track | null;
  onClose: () => void;
  onAdded?: (playlistName: string) => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ 
  visible, 
  track, 
  onClose,
  onAdded 
}) => {
  const { playlists, createPlaylist, addTrackToPlaylist } = usePlayer();
  const theme = useTheme();

  const [playlistName, setPlaylistName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);

  if (!track) return null;

  const handleCreateAndAdd = () => {
    if (playlistName.trim().length === 0) return;
    
    // Create new empty playlist
    const newId = createPlaylist(playlistName.trim());
    // Add the track to it
    addTrackToPlaylist(newId, track);
    
    const name = playlistName.trim();
    setPlaylistName('');
    setShowCreateInput(false);
    
    if (onAdded) {
      onAdded(name);
    }
    onClose();
  };

  const handleSelectPlaylist = (playlistId: string, playlistName: string) => {
    addTrackToPlaylist(playlistId, track);
    if (onAdded) {
      onAdded(playlistName);
    }
    onClose();
  };

  return (
    <Modal 
      visible={visible} 
      transparent={true} 
      animationType="slide" 
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} style={styles.modalOverlay}>
        <Pressable 
          onPress={(e) => e.stopPropagation()} 
          style={[styles.sheetContainer, { backgroundColor: theme.backgroundElement }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>Add to Playlist</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              "{track.title}"
            </ThemedText>
          </View>

          {/* Create New Playlist Toggle Deck */}
          {!showCreateInput ? (
            <Pressable 
              onPress={() => setShowCreateInput(true)}
              style={({ pressed }) => [
                styles.createToggleBtn, 
                { borderColor: theme.primary },
                pressed && { backgroundColor: theme.primary + '15' }
              ]}
            >
              <Icons.AddPlaylist size={20} color={theme.primary} />
              <ThemedText style={{ color: theme.primary, fontWeight: 'bold', fontSize: 14 }}>
                Create New Playlist
              </ThemedText>
            </Pressable>
          ) : (
            <View style={styles.createForm}>
              <TextInput
                placeholder="Enter playlist name..."
                placeholderTextColor={theme.textSecondary}
                value={playlistName}
                onChangeText={setPlaylistName}
                autoFocus={true}
                style={[styles.input, { color: theme.text, borderBottomColor: theme.outline }]}
              />
              <View style={styles.formButtonsRow}>
                <Pressable onPress={() => { setShowCreateInput(false); setPlaylistName(''); }} style={styles.formBtn}>
                  <ThemedText themeColor="textSecondary">Cancel</ThemedText>
                </Pressable>
                <Pressable onPress={handleCreateAndAdd} style={styles.formBtn}>
                  <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>Create & Add</ThemedText>
                </Pressable>
              </View>
            </View>
          )}

          {/* List of Custom Playlists */}
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.playlistsList}
          >
            {playlists.length > 0 ? (
              playlists.map((playlist) => {
                const isAlreadyAdded = playlist.tracks.some(t => t.id === track.id);
                return (
                  <Pressable
                    key={playlist.id}
                    disabled={isAlreadyAdded}
                    onPress={() => handleSelectPlaylist(playlist.id, playlist.name)}
                    style={({ pressed }) => [
                      styles.playlistItem,
                      { borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
                      pressed && !isAlreadyAdded && { backgroundColor: 'rgba(255, 255, 255, 0.04)' },
                      isAlreadyAdded && { opacity: 0.5 }
                    ]}
                  >
                    <View style={styles.playlistArtPlaceholder}>
                      <Icons.Playlists size={20} color={isAlreadyAdded ? theme.textSecondary : theme.primary} />
                    </View>
                    <View style={styles.playlistMeta}>
                      <ThemedText style={styles.playlistName}>{playlist.name}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
                      </ThemedText>
                    </View>
                    {isAlreadyAdded ? (
                      <View style={styles.addedBadge}>
                        <Icons.CheckCircle size={16} color={theme.primary} />
                        <ThemedText type="small" style={{ color: theme.primary, fontWeight: 'bold', marginLeft: 4 }}>
                          Added
                        </ThemedText>
                      </View>
                    ) : (
                      <Icons.ArrowRight size={16} color={theme.textSecondary} />
                    )}
                  </Pressable>
                );
              })
            ) : (
              !showCreateInput && (
                <View style={styles.emptyContainer}>
                  <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                    No custom playlists created yet. Create one above to get started!
                  </ThemedText>
                </View>
              )
            )}
          </ScrollView>

          {/* Close Action */}
          <Pressable 
            onPress={onClose} 
            style={({ pressed }) => [
              styles.closeBtn, 
              pressed && { opacity: 0.8 }
            ]}
          >
            <ThemedText style={{ color: '#E03B3B', fontWeight: 'bold' }}>Close</ThemedText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.four,
    maxHeight: SCREEN_HEIGHT * 0.75,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  createToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
    borderWidth: 1.5,
    marginVertical: Spacing.two,
    gap: Spacing.two,
  },
  createForm: {
    marginVertical: Spacing.two,
    padding: Spacing.three,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  input: {
    fontSize: 15,
    paddingVertical: Spacing.one,
    borderBottomWidth: 1.5,
    marginBottom: Spacing.three,
  },
  formButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.three,
  },
  formBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  playlistsList: {
    paddingVertical: Spacing.two,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.three,
  },
  playlistArtPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  playlistName: {
    fontSize: 15,
    fontWeight: '700',
  },
  addedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.one / 2,
    paddingHorizontal: Spacing.one + 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyContainer: {
    paddingVertical: Spacing.five,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  closeBtn: {
    alignItems: 'center',
    marginTop: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
