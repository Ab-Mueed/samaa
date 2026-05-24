import { BottomTabInset, Spacing } from '@/constants/theme';
import { usePlayer } from '@/context/player-context';
import { useTheme } from '@/hooks/use-theme';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Path } from 'react-native-svg';
import { Icons } from './icons';
import { ThemedText } from './themed-text';

interface PlayerViewProps {
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function PlayerView({ visible, onClose }: PlayerViewProps) {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
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
  const insets = useSafeAreaInsets();

  // Dialog & panel states
  const [showQueue, setShowQueue] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState<number | null>(null);

  // Custom slider width layout tracker
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  // Sleep timer interval ref
  const sleepTimerRef = useRef<any>(null);

  // 60fps Visual position and Wave phase states
  const [visualPosition, setVisualPosition] = useState(position);
  const [wavePhase, setWavePhase] = useState(0);
  const lastTimeRef = useRef<number>(Date.now());
  const animationRef = useRef<number | null>(null);

  // Custom Squash & Pull Transitions
  const playerExpansion = useRef(new Animated.Value(0)).current;

  // Sympathetic scale springs
  const playScale = useRef(new Animated.Value(1)).current;
  const prevScale = useRef(new Animated.Value(1)).current;
  const nextScale = useRef(new Animated.Value(1)).current;

  // Sync visual position whenever true audio player position updates
  useEffect(() => {
    setVisualPosition(position);
    lastTimeRef.current = Date.now();
  }, [position]);

  // Buttery-smooth 60fps local animation ticking loop when playing
  useEffect(() => {
    if (isPlaying) {
      const tick = () => {
        const now = Date.now();
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        setVisualPosition(prev => {
          const next = prev + delta;
          return next > duration ? duration : next;
        });

        setWavePhase(prev => prev + 0.15); // Horizontally flows the wave at 60fps
        animationRef.current = requestAnimationFrame(tick);
      };
      lastTimeRef.current = Date.now();
      animationRef.current = requestAnimationFrame(tick);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, duration]);

  // Handle Android physical back gesture
  useEffect(() => {
    if (visible) {
      const onBackPress = () => {
        onClose();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }
  }, [visible]);

  // Trigger custom open/close animations
  useEffect(() => {
    if (visible) {
      Animated.timing(playerExpansion, {
        toValue: 1,
        duration: 650,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1.0), // Luxurious slow-start ease-in-out curve
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(playerExpansion, {
        toValue: 0,
        duration: 600,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Sleep timer ticker
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

  // Premium smooth SVG Sine Wave Path Generator with Phase-shift
  const generateWavePath = (width: number, phase: number) => {
    if (width <= 0) return '';
    let path = 'M 0 10';
    const period = 14; // wave frequency
    const amplitude = 3.5; // wave height
    const step = 2; // draw segment every 2 pixels for continuous curves

    for (let x = 0; x <= width; x += step) {
      const angle = (x / period) * Math.PI * 2 - phase;
      const y = 10 + Math.sin(angle) * amplitude;
      path += ` L ${x} ${y}`;
    }
    return path;
  };

  const startSleepTimer = (minutes: number) => {
    setSleepTimeRemaining(minutes * 60);
    setShowSleepTimer(false);
  };

  const playedPercent = duration > 0 ? Math.max(0, Math.min(visualPosition / duration, 1)) : 0;
  const currentThumbX = playedPercent * progressBarWidth;

  // Elegant button press micro-interactions
  const handlePlayPress = () => {
    Animated.sequence([
      Animated.spring(playScale, { toValue: 0.92, friction: 5, tension: 50, useNativeDriver: true }),
      Animated.spring(playScale, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
    ]).start();

    togglePlay();
  };

  const handleNextPress = () => {
    Animated.sequence([
      Animated.spring(nextScale, { toValue: 0.9, friction: 5, tension: 50, useNativeDriver: true }),
      Animated.spring(nextScale, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
    ]).start();

    nextTrack();
  };

  const handlePrevPress = () => {
    Animated.sequence([
      Animated.spring(prevScale, { toValue: 0.9, friction: 5, tension: 50, useNativeDriver: true }),
      Animated.spring(prevScale, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
    ]).start();

    prevTrack();
  };

  const MIN_PLAYER_HEIGHT = 72;
  const MIN_PLAYER_WIDTH = SCREEN_WIDTH - 32;
  const MIN_PLAYER_BOTTOM = Platform.OS === 'web' ? 84 : BottomTabInset + 8;
  const MIN_PLAYER_CENTER_Y = SCREEN_HEIGHT - MIN_PLAYER_BOTTOM - (MIN_PLAYER_HEIGHT / 2);
  const FULL_PLAYER_CENTER_Y = SCREEN_HEIGHT / 2;
  const INITIAL_TRANSLATE_Y = MIN_PLAYER_CENTER_Y - FULL_PLAYER_CENTER_Y;

  const INITIAL_SCALE_X = MIN_PLAYER_WIDTH / SCREEN_WIDTH;
  const INITIAL_SCALE_Y = MIN_PLAYER_HEIGHT / SCREEN_HEIGHT;

  const outerAnimatedStyles = {
    opacity: playerExpansion.interpolate({
      inputRange: [0, 0.35, 1],
      outputRange: [0, 1, 1],
    }),
    transform: [
      {
        translateY: playerExpansion.interpolate({
          inputRange: [0, 1],
          outputRange: [SCREEN_HEIGHT, 0],
        })
      },
      {
        scale: playerExpansion.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1],
        })
      }
    ],
  };

  const innerStyles = {
    borderRadius: 28,
  };

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.absoluteOverlay,
        {
          backgroundColor: theme.playerBackground || '#2C2120',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
        },
        outerAnimatedStyles
      ]}
    >
      <Animated.View style={[{ flex: 1, overflow: 'hidden' }, innerStyles]}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.playerBackground || '#2C2120' }]}>

          {/* TOP CONTROLS */}
          <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
            <Pressable onPress={onClose} style={[styles.headerBtnSquare, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
              <Icons.ChevronDown size={24} color="#FFFFFF" />
            </Pressable>
            <View style={styles.headerTitleContainer}>
              <ThemedText style={styles.headerTitle}>Now Playing</ThemedText>
              {sleepTimeRemaining !== null && (
                <ThemedText type="small" style={styles.sleepTimerCounter}>
                  Sleep: {formatTime(sleepTimeRemaining)}
                </ThemedText>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing.two }}>
              <Pressable
                onPress={() => setShowSleepTimer(true)}
                style={[
                  styles.headerBtnSquare,
                  { backgroundColor: 'rgba(255,255,255,0.06)' },
                  sleepTimeRemaining !== null && { borderColor: theme.primary, borderWidth: 1 }
                ]}
              >
                <Icons.SleepTimer size={20} color={sleepTimeRemaining !== null ? theme.primary : '#FFFFFF'} />
              </Pressable>

              <Pressable onPress={() => setShowQueue(true)} style={[styles.headerBtnSquare, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <Icons.Queue size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          {/* CENTER VIEWPORT: GORGEOUS CENTERED ALBUM ART */}
          <View style={styles.centerArtContainer}>
            <View style={[styles.artWrapper, { shadowColor: theme.primary }]}>
              <Image
                source={{ uri: currentTrack.coverUrl }}
                style={styles.albumArt}
                transition={300}
              />
            </View>
          </View>

          {/* METADATA BLOCK */}
          <View style={styles.metaBlock}>
            <ThemedText style={styles.trackTitle} numberOfLines={1}>{currentTrack.title}</ThemedText>
            <ThemedText style={styles.artistName} numberOfLines={1}>{currentTrack.artist}</ThemedText>
          </View>

          {/* PREMIUM SVG WAVY SEEK BAR */}
          <View style={styles.progressContainer}>
            <Pressable
              onPress={handleProgressBarTouch}
              onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
              style={styles.progressBarTrackWrapper}
            >
              {progressBarWidth > 0 && (
                <Svg height="20" width={progressBarWidth} style={styles.waveSvg}>
                  {/* Active Played Wavy Path */}
                  <Path
                    d={generateWavePath(currentThumbX, wavePhase)}
                    fill="none"
                    stroke={theme.primary}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Inactive Remaining Flat Line */}
                  <Line
                    x1={currentThumbX}
                    y1="10"
                    x2={progressBarWidth}
                    y2="10"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </Svg>
              )}

              {/* Slider Thumb Circular Dot */}
              <View
                style={[
                  styles.progressBarThumb,
                  {
                    backgroundColor: '#FFFFFF',
                    left: currentThumbX,
                    transform: [{ translateX: -7 }, { translateY: -7 }]
                  }
                ]}
              />
            </Pressable>

            <View style={styles.timeLabelsRow}>
              <ThemedText type="small" style={styles.timeLabel}>{formatTime(visualPosition)}</ThemedText>
              <ThemedText type="small" style={styles.timeLabel}>{formatTime(duration)}</ThemedText>
            </View>
          </View>

          {/* BOTTOM CONTROLS ROW */}
          <View style={styles.controlsRow}>
            <Animated.View style={{ transform: [{ scale: prevScale }] }}>
              <Pressable onPress={handlePrevPress} style={[styles.controlBtnCircular, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <Icons.SkipBack size={24} color="#FFFFFF" />
              </Pressable>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: playScale }] }}>
              <Pressable
                onPress={handlePlayPress}
                disabled={isBuffering}
                style={({ pressed }) => [
                  styles.playPauseBtnSquare,
                  { backgroundColor: theme.accentContainer || '#FFB4A9' },
                  pressed && { transform: [{ scale: 0.95 }] }
                ]}
              >
                {isBuffering ? (
                  <ActivityIndicator size="large" color={theme.primary} />
                ) : isPlaying ? (
                  <Icons.Pause size={32} color={theme.onPrimary || '#680005'} />
                ) : (
                  <Icons.Play size={32} style={{ marginLeft: 3 }} color={theme.onPrimary || '#680005'} />
                )}
              </Pressable>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: nextScale }] }}>
              <Pressable onPress={handleNextPress} style={[styles.controlBtnCircular, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <Icons.SkipForward size={24} color="#FFFFFF" />
              </Pressable>
            </Animated.View>
          </View>

          {/* CAPSULE UTILITY FOOTER */}
          <View style={[styles.footerCapsule, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
            <Pressable onPress={toggleShuffle} style={styles.footerIconBtn}>
              <Icons.Shuffle size={22} color={isShuffle ? theme.primary : 'rgba(255,255,255,0.5)'} />
            </Pressable>

            <Pressable onPress={toggleRepeat} style={styles.footerIconBtn}>
              <Icons.Repeat size={22} color={isRepeat ? theme.primary : 'rgba(255,255,255,0.5)'} />
            </Pressable>

            <Pressable onPress={() => toggleLike(currentTrack.id)} style={styles.footerIconBtn}>
              {isLiked ? (
                <Icons.Heart size={22} color="#E03B3B" fill="#E03B3B" />
              ) : (
                <Icons.Heart size={22} color="rgba(255,255,255,0.5)" />
              )}
            </Pressable>
          </View>

          {/* SIDE DRAWER: PLAYBACK QUEUE MODAL */}
          {showQueue && (
            <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setShowQueue(false)}>
              <Pressable onPress={() => setShowQueue(false)} style={styles.modalOverlay}>
                <View style={[styles.queueSheet, { backgroundColor: theme.background }]}>
                  <View style={styles.sheetHeader}>
                    <ThemedText style={styles.sheetTitle}>Playback Queue</ThemedText>
                    <Pressable onPress={() => setShowQueue(false)}>
                      <ThemedText type="small" style={{ color: theme.primary, fontWeight: 'bold' }}>Close</ThemedText>
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
          )}

          {/* DIALOG SHEET: SLEEP TIMER */}
          {showSleepTimer && (
            <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setShowSleepTimer(false)}>
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
          )}

        </SafeAreaView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  absoluteOverlay: {
    position: 'absolute',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
  },
  headerBtnSquare: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
  },
  sleepTimerCounter: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  centerArtContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.three,
  },
  artWrapper: {
    borderRadius: 36,
    elevation: 20,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  albumArt: {
    width: SCREEN_WIDTH * 0.78,
    height: SCREEN_WIDTH * 0.78,
    maxWidth: 310,
    maxHeight: 310,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metaBlock: {
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
    marginBottom: Spacing.three,
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  artistName: {
    fontSize: 15,
    marginTop: Spacing.one,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: Spacing.five,
    marginBottom: Spacing.three,
  },
  progressBarTrackWrapper: {
    height: 20,
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  waveSvg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressBarThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'absolute',
    top: '50%',
  },
  timeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  timeLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    marginBottom: Spacing.three,
  },
  controlBtnCircular: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseBtnSquare: {
    width: 80,
    height: 80,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  footerCapsule: {
    width: '90%',
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.five,
    alignSelf: 'center',
    marginBottom: Platform.OS === 'ios' ? 12 : Spacing.four,
  },
  footerIconBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderBottomColor: 'rgba(255,255,255,0.1)',
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
