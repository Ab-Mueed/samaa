import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Pressable, 
  TextInput, 
  Modal, 
  Dimensions, 
  SafeAreaView,
  Platform
} from 'react-native';
import { Image } from 'expo-image';
import { usePlayer, Track } from '@/context/player-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth, ThemeAccent, ACCENT_PALETTES } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PRESET_THEMES: { id: ThemeAccent; name: string; color: string }[] = [
  { id: 'rose', name: 'Samaa Rose', color: '#8F302A' },
  { id: 'teal', name: 'Mint Teal', color: '#006A5C' },
  { id: 'purple', name: 'Royal Purple', color: '#7E2A8F' },
  { id: 'indigo', name: 'Indigo Ocean', color: '#005FAF' },
  { id: 'slate', name: 'Charcoal Slate', color: '#4F5E70' },
  { id: 'amber', name: 'Forest Amber', color: '#785A00' }
];

export default function HomeScreen() {
  const { tracks, playTrack, history, likes, clearHistory, themeAccent, setThemeAccent } = usePlayer();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Filter tracks based on search query
  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate random track for FAB shuffle
  const playRandomTrack = () => {
    if (tracks.length === 0) return;
    const randomIndex = Math.floor(Math.random() * tracks.length);
    playTrack(tracks[randomIndex]);
  };

  // Extract history tracks
  const historyTracks = history.map(id => tracks.find(t => t.id === id)).filter((t): t is Track => !!t);

  // Compute favorite artist from history & likes
  const getFavoriteArtist = () => {
    const artistCounts: { [key: string]: number } = {};
    historyTracks.forEach(t => {
      artistCounts[t.artist] = (artistCounts[t.artist] || 0) + 1;
    });
    let fav = 'Sami Yusuf';
    let max = 0;
    Object.keys(artistCounts).forEach(artist => {
      if (artistCounts[artist] > max) {
        max = artistCounts[artist];
        fav = artist;
      }
    });
    return fav;
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* CAPSULE SEARCH BAR - SCREENSHOT 2 */}
        <View style={[styles.searchContainer, { paddingTop: Math.max(Spacing.two, insets.top) }]}>
          <View style={[styles.searchCapsule, { backgroundColor: theme.backgroundElement }]}>
            <Icons.Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
            <TextInput
              placeholder="Search Nasheeds..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Pressable onPress={() => setShowThemeModal(true)} style={styles.searchSettingsBtn}>
              <Icons.Settings size={20} color={theme.textSecondary} />
            </Pressable>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* QUICK CIRCULAR ACTIONS - SCREENSHOT 2 */}
          <View style={styles.quickActionsRow}>
            <View style={styles.actionItemContainer}>
              <Pressable 
                onPress={() => setShowHistoryModal(true)} 
                style={({ pressed }) => [
                  styles.circleActionButton, 
                  { backgroundColor: theme.backgroundElement },
                  pressed && styles.pressed
                ]}
              >
                <Icons.History size={26} color={theme.text} />
              </Pressable>
              <ThemedText type="smallBold" style={styles.actionLabel}>History</ThemedText>
            </View>

            <View style={styles.actionItemContainer}>
              <Pressable 
                onPress={() => setShowStatsModal(true)} 
                style={({ pressed }) => [
                  styles.circleActionButton, 
                  { backgroundColor: theme.backgroundElement },
                  pressed && styles.pressed
                ]}
              >
                <Icons.Stats size={26} color={theme.text} />
              </Pressable>
              <ThemedText type="smallBold" style={styles.actionLabel}>Stats</ThemedText>
            </View>
          </View>

          {/* SEARCH RESULTS OR QUICK PICKS */}
          {searchQuery.length > 0 ? (
            <View style={styles.sectionContainer}>
              <ThemedText style={[styles.sectionTitle, { color: '#0F4C81' }]}>Search Results</ThemedText>
              {filteredTracks.length > 0 ? (
                filteredTracks.map(track => (
                  <Pressable 
                    key={track.id} 
                    onPress={() => playTrack(track)} 
                    style={({ pressed }) => [styles.trackListItem, pressed && styles.pressed]}
                  >
                    <Image source={{ uri: track.coverUrl }} style={styles.trackListCoverArt} />
                    <View style={styles.trackListMeta}>
                      <ThemedText style={styles.trackListName}>{track.title}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">{track.artist}</ThemedText>
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
              {/* QUICK PICKS - SCREENSHOT 2 */}
              <View style={styles.sectionContainer}>
                <ThemedText style={[styles.sectionTitle, { color: '#003366' }]}>Quick picks</ThemedText>
                
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
                      <ThemedText style={styles.trackListName}>{track.title}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">{track.artist}</ThemedText>
                    </View>
                    <Icons.More size={20} color={theme.textSecondary} />
                  </Pressable>
                ))}
              </View>

              {/* KEEP LISTENING - SCREENSHOT 2 */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <ThemedText style={[styles.sectionTitle, { color: '#003366' }]}>Keep listening</ThemedText>
                </View>

                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContent}
                >
                  {tracks.map(track => (
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
                      <ThemedText numberOfLines={1} style={styles.cardTitle}>{track.title}</ThemedText>
                      <ThemedText numberOfLines={1} type="small" themeColor="textSecondary" style={styles.cardSubtitle}>
                        {track.artist} • {Math.floor(track.duration / 60)}:{(track.duration % 60) < 10 ? '0' : ''}{track.duration % 60}
                      </ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </>
          )}

          {/* Padding for bottom floating player overlay */}
          <View style={{ height: 160 }} />

        </ScrollView>

        {/* BLUE TEAL FLOATING ACTION BUTTON (FAB) - SCREENSHOT 2 */}
        <Pressable 
          onPress={playRandomTrack}
          style={({ pressed }) => [
            styles.fab, 
            { backgroundColor: '#0288D1' }, // Premium blue/teal MD3 FAB
            pressed && styles.fabPressed
          ]}
        >
          <Icons.Shuffle size={26} color="#FFFFFF" />
        </Pressable>

        {/* HISTORY POPUP MODAL */}
        {showHistoryModal && (
          <Modal visible={true} transparent={true} animationType="slide" onRequestClose={() => setShowHistoryModal(false)}>
            <Pressable onPress={() => setShowHistoryModal(false)} style={styles.modalOverlay}>
              <View style={[styles.historySheet, { backgroundColor: theme.background }]}>
                <View style={styles.sheetHeader}>
                  <ThemedText style={styles.sheetTitle}>Listening History</ThemedText>
                  <View style={{ flexDirection: 'row', gap: Spacing.three }}>
                    <Pressable onPress={clearHistory}>
                      <ThemedText type="small" style={{ color: '#E03B3B' }}>Clear</ThemedText>
                    </Pressable>
                    <Pressable onPress={() => setShowHistoryModal(false)}>
                      <ThemedText type="small" style={{ color: theme.primary }}>Close</ThemedText>
                    </Pressable>
                  </View>
                </View>
                <ScrollView style={{ flex: 1 }}>
                  {historyTracks.length > 0 ? (
                    historyTracks.map((track, i) => (
                      <Pressable
                        key={`${track.id}-${i}`}
                        onPress={() => {
                          playTrack(track);
                          setShowHistoryModal(false);
                        }}
                        style={styles.trackListItem}
                      >
                        <Image source={{ uri: track.coverUrl }} style={styles.trackListCoverArt} />
                        <View style={styles.trackListMeta}>
                          <ThemedText style={styles.trackListName}>{track.title}</ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">{track.artist}</ThemedText>
                        </View>
                        <Icons.Play size={18} color={theme.textSecondary} />
                      </Pressable>
                    ))
                  ) : (
                    <ThemedText themeColor="textSecondary" style={styles.emptyHistoryText}>
                      Your listening history is empty. Start playing Nasheeds!
                    </ThemedText>
                  )}
                </ScrollView>
              </View>
            </Pressable>
          </Modal>
        )}

        {/* STATS ANALYTICS POPUP MODAL */}
        {showStatsModal && (
          <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setShowStatsModal(false)}>
            <Pressable onPress={() => setShowStatsModal(false)} style={styles.modalOverlay}>
              <View style={[styles.statsCard, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText style={styles.statsTitle}>Samaa Analytics</ThemedText>
                
                <View style={styles.statsRow}>
                  <ThemedText themeColor="textSecondary">Total Plays:</ThemedText>
                  <ThemedText style={styles.statsValue}>{history.length} tracks</ThemedText>
                </View>
                <View style={styles.statsRow}>
                  <ThemedText themeColor="textSecondary">Liked Tracks:</ThemedText>
                  <ThemedText style={styles.statsValue}>{likes.length} favorited</ThemedText>
                </View>
                <View style={styles.statsRow}>
                  <ThemedText themeColor="textSecondary">Fav Artist:</ThemedText>
                  <ThemedText style={styles.statsValue}>{getFavoriteArtist()}</ThemedText>
                </View>
                <View style={styles.statsRow}>
                  <ThemedText themeColor="textSecondary">Genre Focus:</ThemedText>
                  <ThemedText style={styles.statsValue}>Vocal-Only Spirtual</ThemedText>
                </View>
  
                <Pressable onPress={() => setShowStatsModal(false)} style={styles.statsCloseBtn}>
                  <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>Awesome</ThemedText>
                </Pressable>
              </View>
            </Pressable>
          </Modal>
        )}

        {/* APPEARANCE / THEME SELECTOR MODAL */}
        {showThemeModal && (
          <Modal
            visible={true}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowThemeModal(false)}
          >
            <Pressable onPress={() => setShowThemeModal(false)} style={styles.modalOverlay}>
              <View style={[styles.themeDialog, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText style={styles.dialogTitle}>Appearance Settings</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.dialogSubtitle}>
                  Select an accent color to customize your Material Design theme
                </ThemedText>

                <ScrollView style={styles.themeListContainer} showsVerticalScrollIndicator={false}>
                  {PRESET_THEMES.map((item) => {
                    const isSelected = themeAccent === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => {
                          setThemeAccent(item.id);
                        }}
                        style={[
                          styles.themeOptionRow,
                          isSelected && { backgroundColor: 'rgba(255,255,255,0.08)' }
                        ]}
                      >
                        <View style={[styles.colorSwatch, { backgroundColor: item.color }]} />
                        <ThemedText style={[
                          styles.themeName,
                          isSelected && { fontWeight: 'bold', color: theme.primary }
                        ]}>
                          {item.name}
                        </ThemedText>
                        {isSelected && <Icons.Checked size={18} color={theme.primary} />}
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <Pressable 
                  onPress={() => setShowThemeModal(false)} 
                  style={[styles.dialogCloseBtn, { backgroundColor: theme.primary }]}
                >
                  <ThemedText style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Apply Theme</ThemedText>
                </Pressable>
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
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.five,
    marginVertical: Spacing.three,
  },
  actionItemContainer: {
    alignItems: 'center',
  },
  circleActionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.one,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  actionLabel: {
    fontSize: 13,
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
    fontSize: 22,
    fontWeight: '800',
    marginBottom: Spacing.two,
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
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 170 : 96, // Floats cleanly above the bottom player
    right: Spacing.three,
    width: 60,
    height: 60,
    borderRadius: 16, // Beautiful squarish-circle MD3 FAB!
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 800,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  pressed: {
    opacity: 0.65,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  historySheet: {
    height: SCREEN_WIDTH * 1.2,
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
    borderBottomColor: '#ccc',
  },
  sheetTitle: {
    fontWeight: '800',
    fontSize: 18,
  },
  emptyHistoryText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    paddingHorizontal: Spacing.four,
  },
  statsCard: {
    width: 300,
    borderRadius: 28,
    padding: Spacing.four,
    alignSelf: 'center',
    marginTop: 150,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  statsTitle: {
    fontWeight: '800',
    fontSize: 20,
    marginBottom: Spacing.three,
    textAlign: 'center',
    color: '#0F4C81',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  statsValue: {
    fontWeight: '700',
  },
  statsCloseBtn: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: 20,
    marginTop: Spacing.two,
  },
  dialogTitle: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: Spacing.three,
    textAlign: 'center',
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
    alignSelf: 'center',
  },
  dialogSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: Spacing.three,
    lineHeight: 18,
  },
  themeListContainer: {
    width: '100%',
    maxHeight: 240,
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
});
