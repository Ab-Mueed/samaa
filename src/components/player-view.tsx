import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  Modal, 
  SafeAreaView, 
  Platform,
  Dimensions,
  Share,
  Alert
} from 'react-native';
import { Image } from 'expo-image';
import { usePlayer, Track, LyricLine } from '@/context/player-context';
import { ThemedText } from './themed-text';
import { Icons } from './icons';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface PlayerViewProps {
  visible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function PlayerView({ visible, onClose }: PlayerViewProps) {
  const { 
    currentTrack, 
    isPlaying, 
    position, 
    duration, 
    togglePlay, 
    nextTrack, 
    prevTrack, 
    seekTo, 
    likes, 
    toggleLike,
    isShuffle, 
    isRepeat, 
    toggleShuffle, 
    toggleRepeat,
    queue,
    playTrack
  } = usePlayer();

  const theme = useTheme();

  // Dialog & panel states
  const [showQueue, setShowQueue] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState<number | null>(null);
  
  // Custom slider width layout tracker
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  // Synced lyrics refs & scrolling
  const lyricsScrollViewRef = useRef<ScrollView>(null);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);

  // Sleep timer interval ref
  const sleepTimerRef = useRef<any>(null);

  // Track the sleep timer ticking down
  useEffect(() => {
    if (sleepTimeRemaining !== null) {
      if (sleepTimeRemaining <= 0) {
        if (isPlaying) togglePlay();
        setSleepTimeRemaining(null);
        Alert.alert("Sleep Timer", "Playback paused as requested.");
      } else {
        sleepTimerRef.current = setTimeout(() => {
          setSleepTimeRemaining(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
      }
    }
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [sleepTimeRemaining, isPlaying]);

  // Determine active lyric index
  useEffect(() => {
    if (!currentTrack || !currentTrack.lyrics) return;
    
    let activeIndex = -1;
    for (let i = 0; i < currentTrack.lyrics.length; i++) {
      if (position >= currentTrack.lyrics[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
    setActiveLyricIndex(activeIndex);
  }, [position, currentTrack]);

  // Auto scroll active lyric line into center
  useEffect(() => {
    if (activeLyricIndex !== -1 && lyricsScrollViewRef.current) {
      lyricsScrollViewRef.current.scrollTo({
        y: Math.max(0, activeLyricIndex * 58 - 140),
        animated: true,
      });
    }
  }, [activeLyricIndex]);

  if (!currentTrack) return null;

  const isLiked = likes.includes(currentTrack.id);

  // Formatter for time display
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleProgressBarTouch = (e: any) => {
    const { locationX } = e.nativeEvent;
    if (progressBarWidth > 0 && duration > 0) {
      const percentage = Math.max(0, Math.min(locationX / progressBarWidth, 1));
      const targetSeconds = percentage * duration;
      seekTo(targetSeconds);
    }
  };

  const startSleepTimer = (minutes: number) => {
    setSleepTimeRemaining(minutes * 60);
    setShowSleepTimer(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Listening to "${currentTrack.title}" by ${currentTrack.artist} on Samaa Nasheed App. Join me!`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.playerBackground || '#FFF0EE' }]}>
        
        {/* TOP CONTROLS */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.headerBtn}>
            <Icons.ArrowLeft size={24} color={theme.text} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <ThemedText style={styles.headerTitle}>Now Playing</ThemedText>
            {sleepTimeRemaining !== null && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.sleepTimerCounter}>
                Sleep: {formatTime(sleepTimeRemaining)}
              </ThemedText>
            )}
          </View>
          <Pressable onPress={handleShare} style={styles.headerBtn}>
            <Icons.Share size={24} color={theme.text} />
          </Pressable>
        </View>

        {/* LYRICS & COVER ART VIEWPORT */}
        <View style={styles.lyricsContainer}>
          <ScrollView
            ref={lyricsScrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.lyricsContent}
          >
            {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
              currentTrack.lyrics.map((line, index) => {
                const isActive = index === activeLyricIndex;
                return (
                  <Pressable
                    key={index}
                    onPress={() => seekTo(line.time)}
                    style={[
                      styles.lyricLineContainer,
                      isActive && styles.lyricLineActive
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.lyricText,
                        { 
                          color: isActive ? (theme.primary || '#8F302A') : theme.textSecondary,
                          fontWeight: isActive ? '800' : '500',
                          fontSize: isActive ? 22 : 17,
                          textAlign: 'center',
                        }
                      ]}
                    >
                      {line.text}
                    </ThemedText>
                    {line.translation && (
                      <ThemedText
                        style={[
                          styles.lyricTranslationText,
                          {
                            color: isActive ? theme.text : `${theme.textSecondary}80`,
                            fontSize: isActive ? 15 : 12,
                            textAlign: 'center',
                          }
                        ]}
                      >
                        {line.translation}
                      </ThemedText>
                    )}
                  </Pressable>
                );
              })
            ) : (
              <View style={styles.noLyricsContainer}>
                <Image 
                  source={{ uri: currentTrack.coverUrl }} 
                  style={styles.lyricsCoverArt} 
                />
                <ThemedText themeColor="textSecondary" style={styles.noLyricsText}>
                  Lyrics not available for this track.
                </ThemedText>
              </View>
            )}
          </ScrollView>
        </View>

        {/* METADATA BLOCK */}
        <View style={styles.metaBlock}>
          <View style={styles.metaInfo}>
            <ThemedText style={styles.trackTitle}>{currentTrack.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.artistName}>
              {currentTrack.artist} • {currentTrack.album}
            </ThemedText>
          </View>
        </View>

        {/* CUSTOM SEEK BAR */}
        <View style={styles.progressContainer}>
          <Pressable 
            onPress={handleProgressBarTouch}
            onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
            style={styles.progressBarTrackWrapper}
          >
            <View style={[styles.progressBarBackground, { backgroundColor: theme.backgroundElement }]} />
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  backgroundColor: theme.primary || '#8F302A', 
                  width: `${duration > 0 ? (position / duration) * 100 : 0}%` 
                }
              ]} 
            />
            <View 
              style={[
                styles.progressBarThumb, 
                { 
                  backgroundColor: theme.primary || '#8F302A',
                  left: `${duration > 0 ? (position / duration) * 100 : 0}%`,
                  transform: [{ translateX: -7 }]
                }
              ]} 
            />
          </Pressable>
          
          <View style={styles.timeLabelsRow}>
            <ThemedText type="small" themeColor="textSecondary">{formatTime(position)}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{formatTime(duration)}</ThemedText>
          </View>
        </View>

        {/* PLAYER CONTROLS */}
        <View style={styles.controlsRow}>
          <Pressable 
            onPress={() => toggleLike(currentTrack.id)} 
            style={[styles.smallControlBtn, isLiked && styles.activeControlBtn]}
          >
            {isLiked ? (
              <Icons.Heart size={26} color="#E03B3B" fill="#E03B3B" />
            ) : (
              <Icons.Heart size={26} color={theme.textSecondary} />
            )}
          </Pressable>

          <Pressable onPress={prevTrack} style={styles.normalControlBtn}>
            <Icons.SkipBack size={32} color={theme.text} />
          </Pressable>

          <Pressable 
            onPress={togglePlay} 
            style={[
              styles.playPauseBtn, 
              { backgroundColor: theme.backgroundElement } // Screenshot 3 light background
            ]}
          >
            {isPlaying ? (
              <Icons.Pause size={38} color={theme.text} />
            ) : (
              <Icons.Play size={38} style={{ marginLeft: 4 }} color={theme.text} />
            )}
          </Pressable>

          <Pressable onPress={nextTrack} style={styles.normalControlBtn}>
            <Icons.SkipForward size={32} color={theme.text} />
          </Pressable>

          <Pressable 
            onPress={toggleRepeat} 
            style={[styles.smallControlBtn, isRepeat && styles.activeControlBtn]}
          >
            <Icons.Repeat size={24} color={isRepeat ? (theme.primary || '#8F302A') : theme.textSecondary} />
          </Pressable>
        </View>

        {/* UTILITY FOOTER */}
        <View style={styles.footerRow}>
          <Pressable 
            onPress={() => setShowQueue(!showQueue)} 
            style={styles.footerIcon}
          >
            <Icons.Queue size={22} color={showQueue ? (theme.primary || '#8F302A') : theme.textSecondary} />
          </Pressable>
          <Pressable onPress={() => {}} style={styles.footerIcon}>
            <Icons.Lyrics size={22} color={theme.textSecondary} />
          </Pressable>
          <Pressable 
            onPress={() => setShowSleepTimer(true)} 
            style={styles.footerIcon}
          >
            <Icons.SleepTimer size={22} color={sleepTimeRemaining !== null ? (theme.primary || '#8F302A') : theme.textSecondary} />
          </Pressable>
          <Pressable 
            onPress={toggleShuffle} 
            style={styles.footerIcon}
          >
            <Icons.Shuffle size={22} color={isShuffle ? (theme.primary || '#8F302A') : theme.textSecondary} />
          </Pressable>
          <Pressable onPress={() => {}} style={styles.footerIcon}>
            <Icons.More size={22} color={theme.textSecondary} />
          </Pressable>
        </View>

        {/* SIDE DRAWER: PLAYBACK QUEUE MODAL */}
        <Modal visible={showQueue} transparent={true} animationType="fade">
          <Pressable onPress={() => setShowQueue(false)} style={styles.modalOverlay}>
            <View style={[styles.queueSheet, { backgroundColor: theme.background }]}>
              <View style={styles.sheetHeader}>
                <ThemedText style={styles.sheetTitle}>Playback Queue</ThemedText>
                <Pressable onPress={() => setShowQueue(false)}>
                  <ThemedText type="small" style={{ color: theme.primary }}>Close</ThemedText>
                </Pressable>
              </View>
              <ScrollView style={{ flex: 1 }}>
                {queue.map((track, i) => {
                  const isCurrent = track.id === currentTrack.id;
                  return (
                    <Pressable
                      key={track.id}
                      onPress={() => {
                        playTrack(track);
                        setShowQueue(false);
                      }}
                      style={[
                        styles.queueItem,
                        isCurrent && { backgroundColor: theme.backgroundSelected }
                      ]}
                    >
                      <Image source={{ uri: track.coverUrl }} style={styles.queueCoverArt} />
                      <View style={{ flex: 1 }}>
                        <ThemedText style={{ fontWeight: isCurrent ? 'bold' : 'normal' }}>
                          {track.title}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {track.artist}
                        </ThemedText>
                      </View>
                      {isCurrent && <Icons.Checked size={18} color={theme.primary} />}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        {/* DIALOG SHEET: SLEEP TIMER */}
        <Modal visible={showSleepTimer} transparent={true} animationType="fade">
          <Pressable onPress={() => setShowSleepTimer(false)} style={styles.modalOverlay}>
            <View style={[styles.sleepDialog, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText style={styles.dialogTitle}>Set Sleep Timer</ThemedText>
              
              <Pressable onPress={() => startSleepTimer(15)} style={styles.dialogOption}>
                <ThemedText>15 Minutes</ThemedText>
              </Pressable>
              <Pressable onPress={() => startSleepTimer(30)} style={styles.dialogOption}>
                <ThemedText>30 Minutes</ThemedText>
              </Pressable>
              <Pressable onPress={() => startSleepTimer(45)} style={styles.dialogOption}>
                <ThemedText>45 Minutes</ThemedText>
              </Pressable>
              <Pressable onPress={() => startSleepTimer(60)} style={styles.dialogOption}>
                <ThemedText>1 Hour</ThemedText>
              </Pressable>
              
              {sleepTimeRemaining !== null && (
                <Pressable 
                  onPress={() => {
                    setSleepTimeRemaining(null);
                    setShowSleepTimer(false);
                  }} 
                  style={[styles.dialogOption, styles.dialogCancelOption]}
                >
                  <ThemedText style={{ color: '#E03B3B', fontWeight: 'bold' }}>Cancel Active Timer</ThemedText>
                </Pressable>
              )}

              <Pressable onPress={() => setShowSleepTimer(false)} style={styles.dialogCloseOption}>
                <ThemedText type="small" themeColor="textSecondary">Close</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
  },
  headerBtn: {
    padding: Spacing.two,
    borderRadius: 20,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 16,
  },
  sleepTimerCounter: {
    fontSize: 11,
    marginTop: 1,
    fontWeight: '700',
  },
  lyricsContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: Spacing.two,
  },
  lyricsContent: {
    paddingVertical: 140, // Centering margins
    paddingHorizontal: Spacing.four,
  },
  lyricLineContainer: {
    paddingVertical: Spacing.two,
    marginVertical: Spacing.one,
    borderRadius: 12,
    alignItems: 'center',
  },
  lyricLineActive: {
    transform: [{ scale: 1.04 }],
  },
  lyricText: {
    lineHeight: 32,
  },
  lyricTranslationText: {
    marginTop: 6,
    fontWeight: '500',
  },
  noLyricsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  lyricsCoverArt: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: Spacing.four,
  },
  noLyricsText: {
    fontSize: 15,
    textAlign: 'center',
  },
  metaBlock: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  metaInfo: {
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  artistName: {
    fontSize: 15,
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  progressBarTrackWrapper: {
    height: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    width: '100%',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    left: 0,
  },
  progressBarThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'absolute',
    top: 3,
  },
  timeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.half,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.four,
  },
  smallControlBtn: {
    padding: Spacing.two,
    borderRadius: 24,
  },
  activeControlBtn: {
    transform: [{ scale: 1.05 }],
  },
  normalControlBtn: {
    padding: Spacing.three,
    borderRadius: 28,
  },
  playPauseBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Platform.OS === 'ios' ? 10 : Spacing.three,
    borderTopWidth: 0,
  },
  footerIcon: {
    padding: Spacing.two,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  queueSheet: {
    height: SCREEN_HEIGHT * 0.6,
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
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    marginVertical: Spacing.one,
    borderRadius: 12,
    gap: Spacing.two,
  },
  queueCoverArt: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  sleepDialog: {
    width: 280,
    borderRadius: 28,
    padding: Spacing.four,
    alignSelf: 'center',
    marginTop: SCREEN_HEIGHT * 0.3,
    elevation: 20,
  },
  dialogTitle: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  dialogOption: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: Spacing.one,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dialogCancelOption: {
    borderWidth: 1,
    borderColor: '#E03B3B30',
  },
  dialogCloseOption: {
    alignItems: 'center',
    marginTop: Spacing.two,
    paddingTop: Spacing.one,
  },
});
