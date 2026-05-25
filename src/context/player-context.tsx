import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { ThemeAccent } from '@/constants/theme';
import { QuranReciter, PRESET_RECITERS, QuranService } from '@/services/quran-service';
import { NasheedService } from '@/services/nasheed-service';

export interface LyricLine {
  time: number; // in seconds
  text: string; // original lyrics
  translation?: string; // English translation
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  audioUrl: string;
  coverUrl: string;
  lyrics: LyricLine[];
}

export interface CustomPlaylist {
  id: string;
  name: string;
  tracks: Track[];
}

export interface PlayerContextProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  queue: Track[];
  currentIndex: number;
  likes: string[];
  history: string[];
  isShuffle: boolean;
  isRepeat: boolean;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleLike: (track: Track) => void;
  likedTracks: Track[];
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  playAll: (trackList: Track[], startIndex?: number) => void;
  clearHistory: () => void;
  themeAccent: ThemeAccent;
  setThemeAccent: (accent: ThemeAccent) => void;
  userName: string;
  setUserName: (name: string) => void;

  // NEW DUAL MODE PROPERTIES
  activeMode: 'nasheed' | 'quran';
  setActiveMode: (mode: 'nasheed' | 'quran') => void;
  activeReciter: QuranReciter;
  setActiveReciter: (reciter: QuranReciter) => void;
  quranReciters: QuranReciter[];
  isSwitchingMode: boolean;
  quranTracks: Track[];
  searchNasheeds: (query: string) => Promise<Track[]>;

  // GLOBAL CUSTOM PLAYLISTS
  playlists: CustomPlaylist[];
  createPlaylist: (name: string) => string;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
}

export interface PlayerProgressContextProps {
  position: number;
  duration: number;
  seekTo: (seconds: number) => void;
}

export const PlayerProgressContext = createContext<PlayerProgressContextProps | undefined>(undefined);

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined);

const getRandomIndex = (length: number): number => {
  return Math.floor(Math.random() * length);
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // NEW MODE SEPARATED STATES
  const [activeMode, setActiveModeState] = useState<'nasheed' | 'quran'>('nasheed');
  const [isSwitchingMode, setIsSwitchingMode] = useState<boolean>(false);
  const [activeReciter, setActiveReciterState] = useState<QuranReciter>(PRESET_RECITERS[0]);
  const [quranTracks, setQuranTracks] = useState<Track[]>([]);
  const [nasheedTracks, setNasheedTracks] = useState<Track[]>([]);

  // Sandbox 1: Nasheed States
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const [customQueue, setCustomQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [likes, setLikes] = useState<string[]>([]);
  const [likedNasheedTracks, setLikedNasheedTracks] = useState<Track[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  // Sandbox 2: Quran States
  const [quranCurrentTrack, setQuranCurrentTrack] = useState<Track | null>(null);
  const [quranIsPlaying, setQuranIsPlaying] = useState<boolean>(false);
  const [quranIsBuffering, setQuranIsBuffering] = useState<boolean>(false);
  const [quranPosition, setQuranPosition] = useState<number>(0);
  const [quranDuration, setQuranDuration] = useState<number>(0);
  const [quranQueue, setQuranQueue] = useState<Track[]>([]);
  const [quranCustomQueue, setQuranCustomQueue] = useState<Track[]>([]);
  const [quranCurrentIndex, setQuranCurrentIndex] = useState<number>(-1);
  const [quranLikes, setQuranLikes] = useState<string[]>([]);
  const [likedQuranTracks, setLikedQuranTracks] = useState<Track[]>([]);
  const [quranHistory, setQuranHistory] = useState<string[]>([]);

  // Layout preference states (OLED theme is AMOLED by default)
  const [themeAccent, setThemeAccent] = useState<ThemeAccent>('amoled');
  const [userName, setUserName] = useState<string>('Guest');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);

  // GLOBAL CUSTOM PLAYLISTS STATE
  const [playlists, setPlaylists] = useState<CustomPlaylist[]>([]);

  // Mode reference to avoid stale closures in active tickers
  const activeModeRef = useRef<'nasheed' | 'quran'>('nasheed');

  useEffect(() => {
    activeModeRef.current = activeMode;
  }, [activeMode]);

  // References to avoid stale closures in active tickers
  const queueRef = useRef<Track[]>([]);
  const quranQueueRef = useRef<Track[]>([]);
  const customQueueRef = useRef<Track[]>([]);
  const quranCustomQueueRef = useRef<Track[]>([]);
  const currentIndexRef = useRef<number>(-1);
  const quranCurrentIndexRef = useRef<number>(-1);
  const currentTrackRef = useRef<Track | null>(null);
  const quranCurrentTrackRef = useRef<Track | null>(null);
  const isShuffleRef = useRef<boolean>(false);
  const isRepeatRef = useRef<boolean>(false);
  const nasheedTracksRef = useRef<Track[]>([]);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { quranQueueRef.current = quranQueue; }, [quranQueue]);
  useEffect(() => { customQueueRef.current = customQueue; }, [customQueue]);
  useEffect(() => { quranCustomQueueRef.current = quranCustomQueue; }, [quranCustomQueue]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { quranCurrentIndexRef.current = quranCurrentIndex; }, [quranCurrentIndex]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { quranCurrentTrackRef.current = quranCurrentTrack; }, [quranCurrentTrack]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { isRepeatRef.current = isRepeat; }, [isRepeat]);
  useEffect(() => { nasheedTracksRef.current = nasheedTracks; }, [nasheedTracks]);

  // Audio Driver references
  const nativePlayerRef = useRef<any>(null);
  const webAudioRef = useRef<HTMLAudioElement | null>(null);
  const webTimerRef = useRef<any>(null);

  useEffect(() => {
    // Initialize background lock screen configurations
    if (Platform.OS !== 'web') {
      setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMix',
      }).catch(err => {
        console.log('Error setting audio mode', err);
      });
    }

    // Dynamic Initial Quran Tracks Fetch
    loadQuranTracks(activeReciter);

    // Initial Trending Nasheeds Fetch
    loadNasheedTracks();

    return () => {
      cleanupDrivers();
    };
  }, []);

  const loadNasheedTracks = async () => {
    const list = await NasheedService.fetchTrending();
    setNasheedTracks(list);
  };

  // Fetch and format Quran Surahs dynamically when active reciter changes
  const loadQuranTracks = async (reciter: QuranReciter) => {
    try {
      const surahs = await QuranService.fetchSurahs();
      const tracksList = surahs.map(surah => QuranService.transformToTrack(surah, reciter));
      setQuranTracks(tracksList);
      return tracksList;
    } catch (e) {
      console.log('Error loading Quran tracks', e);
      return [];
    }
  };

  const setActiveReciter = async (reciter: QuranReciter) => {
    // If playing, pause audio first to let player re-register the correct server URLs cleanly
    pauseAudio();
    setActiveReciterState(reciter);
    const loadedList = await loadQuranTracks(reciter);
    
    // Dynamically update existing custom queue tracks to map to the new reciter's server URLs
    setQuranQueue(prev => prev.map(track => {
      const surahNum = parseInt(track.id.split('_').pop() || '1');
      const matching = loadedList.find(t => t.id.endsWith(`_${surahNum}`));
      return matching ? matching : track;
    }));
    setQuranCustomQueue(prev => prev.map(track => {
      const surahNum = parseInt(track.id.split('_').pop() || '1');
      const matching = loadedList.find(t => t.id.endsWith(`_${surahNum}`));
      return matching ? matching : track;
    }));
    
    // Reset Quran active player state so it doesn't try to buffer stale URLs
    setQuranCurrentTrack(null);
    setQuranCurrentIndex(-1);
    setQuranPosition(0);
    setQuranDuration(0);
  };

  const setActiveMode = async (mode: 'nasheed' | 'quran') => {
    if (mode === activeMode) return;

    // Immediately pause any active playback first to keep audio isolated
    pauseAudio();

    // Trigger loading spinner overlay transition
    setIsSwitchingMode(true);
    setActiveModeState(mode);

    // High fidelity Material switch transition settling time
    setTimeout(() => {
      setIsSwitchingMode(false);
    }, 600);
  };

  function cleanupDrivers() {
    if (webAudioRef.current) {
      webAudioRef.current.pause();
      webAudioRef.current = null;
    }
    if (webTimerRef.current) {
      clearInterval(webTimerRef.current);
      webTimerRef.current = null;
    }
    if (nativePlayerRef.current) {
      try {
        nativePlayerRef.current.pause();
        nativePlayerRef.current.release();
      } catch (err) {
        console.log('Error releasing native player', err);
      }
      nativePlayerRef.current = null;
    }
  }

  // Keep track of web time progress
  const startWebTimer = () => {
    if (webTimerRef.current) clearInterval(webTimerRef.current);
    webTimerRef.current = setInterval(() => {
      if (webAudioRef.current && !webAudioRef.current.paused) {
        const pos = webAudioRef.current.currentTime;
        const dur = webAudioRef.current.duration || 0;

        if (activeModeRef.current === 'quran') {
          setQuranPosition(pos);
          setQuranDuration(dur);
          setQuranIsBuffering(false);
        } else {
          setPosition(pos);
          setDuration(dur);
          setIsBuffering(false);
        }

        if (webAudioRef.current.ended) {
          clearInterval(webTimerRef.current);
          handleTrackFinished();
        }
      }
    }, 250);
  };

  // Keep track of native time progress
  const startNativeTimer = (player: any) => {
    if (webTimerRef.current) clearInterval(webTimerRef.current);
    webTimerRef.current = setInterval(() => {
      if (player) {
        const currentPos = player.currentTime || 0;
        const totalDuration = player.duration || 0;
        const currentBuffering = player.isBuffering || false;

        if (activeModeRef.current === 'quran') {
          setQuranPosition(currentPos);
          setQuranDuration(totalDuration);
          setQuranIsBuffering(currentBuffering);
        } else {
          setPosition(currentPos);
          setDuration(totalDuration);
          setIsBuffering(currentBuffering);
        }

        if (currentPos >= totalDuration && totalDuration > 0) {
          clearInterval(webTimerRef.current);
          handleTrackFinished();
        }
      }
    }, 250);
  };

  const handleTrackFinished = () => {
    if (isRepeatRef.current) {
      seekTo(0);
      resumeAudio();
    } else {
      nextTrack();
    }
  };

  const playTrack = async (track: Track) => {
    cleanupDrivers();
    const isQuran = activeMode === 'quran';

    if (isQuran) {
      setQuranCurrentTrack(track);
      setQuranPosition(0);
      setQuranDuration(track.duration);
      setQuranIsPlaying(true);
      setQuranIsBuffering(true);

      const qIndex = quranQueue.findIndex(t => t.id === track.id);
      if (qIndex !== -1) {
        setQuranCurrentIndex(qIndex);
      } else {
        const trackIndex = quranTracks.findIndex(t => t.id === track.id);
        setQuranCurrentIndex(trackIndex);
      }

      setQuranHistory(prev => {
        const filtered = prev.filter(id => id !== track.id);
        return [track.id, ...filtered].slice(0, 10);
      });
    } else {
      setCurrentTrack(track);
      setPosition(0);
      setDuration(track.duration);
      setIsPlaying(true);
      setIsBuffering(true);

      const qIndex = queue.findIndex(t => t.id === track.id);
      if (qIndex !== -1) {
        setCurrentIndex(qIndex);
      } else {
        const trackIndex = nasheedTracksRef.current.findIndex(t => t.id === track.id);
        setCurrentIndex(trackIndex);
      }

      setHistory(prev => {
        const filtered = prev.filter(id => id !== track.id);
        return [track.id, ...filtered].slice(0, 10);
      });
    }

    // RESOLVE NASHEED STREAM URL DYNAMICALLY
    let playbackUrl = track.audioUrl;
    if (!isQuran && track.id && !track.id.startsWith('mock_')) {
      const resolvedUrl = await NasheedService.fetchStreamUrl(track.id);
      if (resolvedUrl) {
        playbackUrl = resolvedUrl;
      }
    }

    if (Platform.OS === 'web') {
      try {
        const audio = new window.Audio(playbackUrl);
        audio.play().then(() => {
          if (isQuran) {
            setQuranIsPlaying(true);
            setQuranIsBuffering(false);
          } else {
            setIsPlaying(true);
            setIsBuffering(false);
          }
          startWebTimer();
        }).catch((err) => {
          console.log('Autoplay deferred, awaiting interaction', err);
          if (isQuran) {
            setQuranIsPlaying(true);
            setQuranIsBuffering(false);
          } else {
            setIsPlaying(true);
            setIsBuffering(false);
          }
          startWebTimer();
        });
        webAudioRef.current = audio;
      } catch (e) {
        console.log('Web audio load failed, fallback mock', e);
        mockPlayTimer(track.duration);
      }
    } else {
      try {
        const player = createAudioPlayer(playbackUrl);
        player.setActiveForLockScreen(true, {
          title: track.title,
          artist: track.artist,
          artworkUrl: track.coverUrl
        });

        player.play();
        nativePlayerRef.current = player;
        if (isQuran) {
          setQuranIsPlaying(true);
        } else {
          setIsPlaying(true);
        }
        startNativeTimer(player);
      } catch (err) {
        console.log('Native playback loading failed, running mock', err);
        mockPlayTimer(track.duration);
      }
    }
  };

  const mockPlayTimer = (trackDuration: number) => {
    const isQuran = activeMode === 'quran';
    if (isQuran) {
      setQuranIsBuffering(false);
    } else {
      setIsBuffering(false);
    }

    if (webTimerRef.current) clearInterval(webTimerRef.current);
    webTimerRef.current = setInterval(() => {
      if (isQuran) {
        setQuranPosition(prev => {
          if (prev >= trackDuration) {
            clearInterval(webTimerRef.current);
            handleTrackFinished();
            return 0;
          }
          return prev + 1;
        });
      } else {
        setPosition(prev => {
          if (prev >= trackDuration) {
            clearInterval(webTimerRef.current);
            handleTrackFinished();
            return 0;
          }
          return prev + 1;
        });
      }
    }, 1000);
  };

  const resumeAudio = () => {
    const isQuran = activeModeRef.current === 'quran';
    if (isQuran) {
      setQuranIsPlaying(true);
    } else {
      setIsPlaying(true);
    }

    if (Platform.OS === 'web') {
      if (isQuran) setQuranIsBuffering(false);
      else setIsBuffering(false);

      if (webAudioRef.current) {
        webAudioRef.current.play().catch(e => console.log(e));
        startWebTimer();
      } else {
        const track = isQuran ? quranCurrentTrackRef.current : currentTrackRef.current;
        if (track) mockPlayTimer(track.duration);
      }
    } else {
      if (nativePlayerRef.current) {
        if (isQuran) {
          setQuranIsBuffering(nativePlayerRef.current.isBuffering || false);
        } else {
          setIsBuffering(nativePlayerRef.current.isBuffering || false);
        }
        nativePlayerRef.current.play();
        startNativeTimer(nativePlayerRef.current);
      } else {
        const track = isQuran ? quranCurrentTrackRef.current : currentTrackRef.current;
        if (track) mockPlayTimer(track.duration);
      }
    }
  };

  const pauseAudio = () => {
    const isQuran = activeMode === 'quran';
    if (isQuran) {
      setQuranIsPlaying(false);
      setQuranIsBuffering(false);
    } else {
      setIsPlaying(false);
      setIsBuffering(false);
    }

    if (Platform.OS === 'web') {
      if (webAudioRef.current) {
        webAudioRef.current.pause();
      }
      if (webTimerRef.current) {
        clearInterval(webTimerRef.current);
      }
    } else {
      if (nativePlayerRef.current) {
        nativePlayerRef.current.pause();
      }
      if (webTimerRef.current) {
        clearInterval(webTimerRef.current);
      }
    }
  };

  const togglePlay = () => {
    const isQuran = activeMode === 'quran';
    const track = isQuran ? quranCurrentTrack : currentTrack;
    const activeQueue = isQuran ? quranQueue : queue;
    const activeIsPlaying = isQuran ? quranIsPlaying : isPlaying;

    if (!track) {
      if (activeQueue.length > 0) {
        playTrack(activeQueue[0]);
      }
      return;
    }

    if (activeIsPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  const nextTrack = () => {
    const isQuran = activeModeRef.current === 'quran';
    const activeCustomQueue = isQuran ? quranCustomQueueRef.current : customQueueRef.current;
    const currentTrackObj = isQuran ? quranCurrentTrackRef.current : currentTrackRef.current;

    // 1. Explicit Custom Queue takes priority
    if (activeCustomQueue.length > 0) {
      const isCurrentFromQueue = currentTrackObj && currentTrackObj.id === activeCustomQueue[0].id;

      if (isCurrentFromQueue) {
        // Remove played track from the custom queue
        const nextCustomQueue = activeCustomQueue.slice(1);
        if (isQuran) {
          setQuranCustomQueue(nextCustomQueue);
        } else {
          setCustomQueue(nextCustomQueue);
        }

        if (nextCustomQueue.length > 0) {
          playTrack(nextCustomQueue[0]);
        } else {
          // Once the queue is empty, the last track finishes and playback stops
          pauseAudio();
        }
      } else {
        // Play the first item in custom queue without slicing
        playTrack(activeCustomQueue[0]);
      }
      return;
    }

    // 2. Fall back to the contextual list (either activeQueue or full category tracks)
    const activeQueue = isQuran ? quranQueueRef.current : queueRef.current;
    const fallbackList = activeQueue.length > 0 ? activeQueue : (isQuran ? quranTracks : nasheedTracksRef.current);
    const activeIndex = isQuran ? quranCurrentIndexRef.current : currentIndexRef.current;

    if (fallbackList.length === 0) return;

    let nextIndex = activeIndex + 1;
    if (isShuffleRef.current) {
      nextIndex = getRandomIndex(fallbackList.length);
    } else if (nextIndex >= fallbackList.length) {
      nextIndex = 0; // loop/restart
    }

    playTrack(fallbackList[nextIndex]);
  };

  const prevTrack = () => {
    const isQuran = activeModeRef.current === 'quran';
    const activeCustomQueue = isQuran ? quranCustomQueueRef.current : customQueueRef.current;

    if (activeCustomQueue.length > 0) {
      // Seeking to 0 is the most natural behavior for custom queue navigation
      seekTo(0);
      return;
    }

    const activeQueue = isQuran ? quranQueueRef.current : queueRef.current;
    const fallbackList = activeQueue.length > 0 ? activeQueue : (isQuran ? quranTracks : nasheedTracksRef.current);
    const activeIndex = isQuran ? quranCurrentIndexRef.current : currentIndexRef.current;

    if (fallbackList.length === 0) return;

    let prevIndex = activeIndex - 1;
    if (prevIndex < 0) {
      prevIndex = fallbackList.length - 1; // loop backwards
    }

    playTrack(fallbackList[prevIndex]);
  };

  const seekTo = (seconds: number) => {
    const isQuran = activeMode === 'quran';
    if (isQuran) {
      setQuranPosition(seconds);
    } else {
      setPosition(seconds);
    }

    if (Platform.OS === 'web') {
      if (webAudioRef.current) {
        webAudioRef.current.currentTime = seconds;
      }
    } else {
      if (nativePlayerRef.current) {
        nativePlayerRef.current.seekTo(seconds);
      }
    }
  };

  const toggleLike = (track: Track) => {
    const isQuran = activeMode === 'quran';
    if (isQuran) {
      setQuranLikes(prev => {
        const exists = prev.includes(track.id);
        if (exists) {
          setLikedQuranTracks(prevTracks => prevTracks.filter(t => t.id !== track.id));
          return prev.filter(id => id !== track.id);
        } else {
          setLikedQuranTracks(prevTracks => [...prevTracks, track]);
          return [...prev, track.id];
        }
      });
    } else {
      setLikes(prev => {
        const exists = prev.includes(track.id);
        if (exists) {
          setLikedNasheedTracks(prevTracks => prevTracks.filter(t => t.id !== track.id));
          return prev.filter(id => id !== track.id);
        } else {
          setLikedNasheedTracks(prevTracks => [...prevTracks, track]);
          return [...prev, track.id];
        }
      });
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const addToQueue = (track: Track) => {
    const isQuran = activeMode === 'quran';
    if (isQuran) {
      if (!quranCustomQueue.find(t => t.id === track.id)) {
        setQuranCustomQueue(prev => [...prev, track]);
      }
    } else {
      if (!customQueue.find(t => t.id === track.id)) {
        setCustomQueue(prev => [...prev, track]);
      }
    }
  };

  const removeFromQueue = (trackId: string) => {
    const isQuran = activeMode === 'quran';
    if (isQuran) {
      if (quranCustomQueue.length > 0) {
        setQuranCustomQueue(prev => prev.filter(t => t.id !== trackId));
      } else {
        setQuranQueue(prev => {
          const nextQueue = prev.filter(t => t.id !== trackId);
          const nextIndex = nextQueue.findIndex(t => t.id === quranCurrentTrack?.id);
          setQuranCurrentIndex(nextIndex);
          return nextQueue;
        });
      }
    } else {
      if (customQueue.length > 0) {
        setCustomQueue(prev => prev.filter(t => t.id !== trackId));
      } else {
        setQueue(prev => {
          const nextQueue = prev.filter(t => t.id !== trackId);
          const nextIndex = nextQueue.findIndex(t => t.id === currentTrack?.id);
          setCurrentIndex(nextIndex);
          return nextQueue;
        });
      }
    }
  };

  const clearQueue = () => {
    const isQuran = activeMode === 'quran';
    if (isQuran) {
      setQuranCustomQueue([]);
      setQuranQueue([]);
      setQuranCurrentIndex(-1);
      setQuranCurrentTrack(null);
      pauseAudio();
    } else {
      setCustomQueue([]);
      setQueue([]);
      setCurrentIndex(-1);
      setCurrentTrack(null);
      pauseAudio();
    }
  };

  const playAll = (trackList: Track[], startIndex = 0) => {
    const isQuran = activeMode === 'quran';
    if (isQuran) {
      setQuranQueue(trackList);
    } else {
      setQueue(trackList);
    }
    if (trackList.length > 0) {
      playTrack(trackList[startIndex]);
    }
  };

  const clearHistory = () => {
    const isQuran = activeMode === 'quran';
    if (isQuran) {
      setQuranHistory([]);
    } else {
      setHistory([]);
    }
  };

  const searchNasheeds = async (query: string): Promise<Track[]> => {
    return await NasheedService.search(query);
  };

  const createPlaylist = (name: string): string => {
    const id = Date.now().toString();
    const newPlaylist: CustomPlaylist = {
      id,
      name,
      tracks: []
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    return id;
  };

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        const exists = pl.tracks.some(t => t.id === track.id);
        if (exists) return pl;
        return {
          ...pl,
          tracks: [...pl.tracks, track]
        };
      }
      return pl;
    }));
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        return {
          ...pl,
          tracks: pl.tracks.filter(t => t.id !== trackId)
        };
      }
      return pl;
    }));
  };

  // Map dynamic values based on the currently active mode sandbox
  const contextTracks = activeMode === 'nasheed' ? nasheedTracks : quranTracks;
  const contextCurrentTrack = activeMode === 'nasheed' ? currentTrack : quranCurrentTrack;
  const contextIsPlaying = activeMode === 'nasheed' ? isPlaying : quranIsPlaying;
  const contextIsBuffering = activeMode === 'nasheed' ? isBuffering : quranIsBuffering;
  const contextPosition = activeMode === 'nasheed' ? position : quranPosition;
  const contextDuration = activeMode === 'nasheed' ? duration : quranDuration;
  const contextQueue = activeMode === 'nasheed' ? customQueue : quranCustomQueue;
  const contextCurrentIndex = activeMode === 'nasheed' ? currentIndex : quranCurrentIndex;
  const contextLikes = activeMode === 'nasheed' ? likes : quranLikes;
  const contextHistory = activeMode === 'nasheed' ? history : quranHistory;
  const contextLikedTracks = activeMode === 'nasheed' ? likedNasheedTracks : likedQuranTracks;

  const contextValue = React.useMemo(() => ({
    tracks: contextTracks,
    currentTrack: contextCurrentTrack,
    isPlaying: contextIsPlaying,
    isBuffering: contextIsBuffering,
    queue: contextQueue,
    currentIndex: contextCurrentIndex,
    likes: contextLikes,
    likedTracks: contextLikedTracks,
    history: contextHistory,
    isShuffle,
    isRepeat,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    toggleLike,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playAll,
    clearHistory,
    themeAccent,
    setThemeAccent,
    userName,
    setUserName,

    // NEW DUAL MODE PROPERTIES
    activeMode,
    setActiveMode,
    activeReciter,
    setActiveReciter,
    quranReciters: PRESET_RECITERS,
    isSwitchingMode,
    quranTracks,
    searchNasheeds,

    // GLOBAL CUSTOM PLAYLISTS
    playlists,
    createPlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
  }), [
    contextTracks,
    contextCurrentTrack,
    contextIsPlaying,
    contextIsBuffering,
    contextQueue,
    contextCurrentIndex,
    contextLikes,
    contextLikedTracks,
    contextHistory,
    isShuffle,
    isRepeat,
    themeAccent,
    userName,
    activeMode,
    activeReciter,
    isSwitchingMode,
    quranTracks,
    customQueue,
    quranCustomQueue,
    searchNasheeds,
    likedNasheedTracks,
    likedQuranTracks,
    playlists,
  ]);

  const progressValue = React.useMemo(() => ({
    position: contextPosition,
    duration: contextDuration,
    seekTo,
  }), [contextPosition, contextDuration]);

  return (
    <PlayerContext.Provider value={contextValue}>
      <PlayerProgressContext.Provider value={progressValue}>
        {children}
      </PlayerProgressContext.Provider>
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const usePlayerProgress = () => {
  const context = useContext(PlayerProgressContext);
  if (context === undefined) {
    throw new Error('usePlayerProgress must be used within a PlayerProvider');
  }
  return context;
};
