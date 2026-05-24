import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { ThemeAccent } from '@/constants/theme';
import { QuranReciter, PRESET_RECITERS, QuranService } from '@/services/quran-service';

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

export interface PlayerContextProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  position: number; // in seconds
  duration: number; // in seconds
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
  seekTo: (seconds: number) => void;
  toggleLike: (trackId: string) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
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
}

export const MOCK_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Hasbi Rabbi',
    artist: 'Sami Yusuf',
    album: 'Al-Mu`allim',
    duration: 247,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=500&q=80',
    lyrics: [
      { time: 0, text: "♪ (Vocal Intro)" },
      { time: 4, text: "Hasbi rabbi jallallah", translation: "Sufficient is my Lord, glorified is Allah" },
      { time: 9, text: "Ma fi qalbi ghayrullah", translation: "In my heart there is none except Allah" },
      { time: 14, text: "Alal hadi sallallah", translation: "Upon the Guide (Prophet Muhammad), peace be from Allah" },
      { time: 19, text: "La ilaha illallah", translation: "There is no deity worthy of worship but Allah" },
      { time: 24, text: "O Allah, protect and guide me", translation: "O Allah, protect and guide me" },
      { time: 29, text: "Keep me close to Your side", translation: "Keep me close to Your side" },
      { time: 34, text: "Direct me and light my way", translation: "Direct me and light my way" },
      { time: 39, text: "Let me see the brand new day", translation: "Let me see the brand new day" },
      { time: 44, text: "In Your love, I find my peace", translation: "In Your love, I find my peace" },
      { time: 49, text: "All my worries find release", translation: "All my worries find release" },
      { time: 54, text: "Hasbi rabbi jallallah", translation: "Sufficient is my Lord, glorified is Allah" },
      { time: 59, text: "Ma fi qalbi ghayrullah", translation: "In my heart there is none except Allah" },
      { time: 64, text: "Alal hadi sallallah", translation: "Upon the Guide, peace be from Allah" },
      { time: 69, text: "La ilaha illallah", translation: "There is no deity worthy of worship but Allah" },
      { time: 74, text: "♪ (Spiritual Chants)" },
      { time: 94, text: "Ya Sayyidal Kawnayni", translation: "O master of the two worlds" },
      { time: 99, text: "Ya Shafi`al Ummatayni", translation: "O intercessor for the two nations" },
      { time: 104, text: "Sallallahu `alaika wa `ala alika", translation: "Peace and blessings be upon you and your family" },
      { time: 109, text: "Hasbi rabbi jallallah", translation: "Sufficient is my Lord, glorified is Allah" },
      { time: 114, text: "Ma fi qalbi ghayrullah", translation: "In my heart there is none except Allah" }
    ]
  },
  {
    id: '2',
    title: 'Kun Anta',
    artist: 'Humood AlKhudher',
    album: 'Aseer Ahsan',
    duration: 236,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=500&q=80',
    lyrics: [
      { time: 0, text: "♪ (Upbeat vocal harmony intro)" },
      { time: 6, text: "Li-ajli an nurdiya-hum, na`tazilu ma yurdina", translation: "To please them, we give up what pleases us" },
      { time: 13, text: "Nalbasu thawban la yulaimu-na, naqoolu ma la ya`nina", translation: "We wear clothes that don't suit us, we say what doesn't concern us" },
      { time: 20, text: "Nutaba`i shayan ghairana, nattahimu wa nadh`an", translation: "We follow things unlike us, we suspect and yield" },
      { time: 27, text: "Kayi nuzdada jamalan, nuqallidu aghla al-madha-hir", translation: "To increase our beauty, we copy the most expensive styles" },
      { time: 33, text: "La la! La nahtaju al-ma-la, kayi nuzdada jamalan", translation: "No, no! We don't need wealth to increase our beauty" },
      { time: 40, text: "Jawahiruna huna, fi al-qalbi tal-ala-la", translation: "Our gems are here, in the heart they shine" },
      { time: 47, text: "La la! Nurdi al-nasi bimala, nardahu lana ha-la", translation: "No, no! We won't please people with what we don't satisfy in ourselves" },
      { time: 54, text: "Sa-akunu ana, bima ardahu ana", translation: "I will be myself, exactly as I wish to be" },
      { time: 60, text: "Sa-akunu ana, kun anta!", translation: "I will be myself, be yourself!" },
      { time: 65, text: "♪ (Be yourself chorus)" },
      { time: 75, text: "Kun anta tazdada jamalan", translation: "Be yourself, and you will increase in beauty" },
      { time: 82, text: "Kun anta tazdada jamalan", translation: "Be yourself, and you will increase in beauty" }
    ]
  },
  {
    id: '3',
    title: 'Rahman Ya Rahman',
    artist: 'Mishari Rashid Alafasy',
    album: 'Alafasy Vocal',
    duration: 312,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=500&q=80',
    lyrics: [
      { time: 0, text: "♪ (Beautiful solo vocals)" },
      { time: 5, text: "Rahman Ya Rahman, sa`idni Ya Rahman", translation: "O Most Beneficent, O Beneficent, help me O Beneficent" },
      { time: 14, text: "Ishrah sadri Qur'an, imla' qalbi Qur'an", translation: "Expand my chest with the Qur'an, fill my heart with the Qur'an" },
      { time: 24, text: "Wasqi `umri Qur'an", translation: "And water my life with the Qur'an" },
      { time: 30, text: "Rahman Ya Rahman, sa`idni Ya Rahman", translation: "O Most Beneficent, O Beneficent, help me O Beneficent" },
      { time: 39, text: "Lillah lillah, yahfo-dhu ah-dahu", translation: "For Allah's sake, he preserves His covenant" },
      { time: 48, text: "Fa yuthabbita fihi waj-dahu", translation: "So his devotion is strengthened in it" },
      { time: 57, text: "Sadun ya'ti sa`dahu, ghufra-nuka Rabbi", translation: "Happiness comes to his aid, Your forgiveness my Lord" },
      { time: 66, text: "Rahman Ya Rahman, sa`idni Ya Rahman", translation: "O Most Beneficent, O Beneficent, help me O Beneficent" }
    ]
  },
  {
    id: '4',
    title: 'The Way of the Tears',
    artist: 'Muhammad al-Muqit',
    album: 'Vocal Solitude',
    duration: 288,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=500&q=80',
    lyrics: [
      { time: 0, text: "♪ (Soft, deep vocal echoing)" },
      { time: 8, text: "Saraytu wa layli da-jin wa bah-mu", translation: "I walked while the night was dark and silent" },
      { time: 17, text: "Wa dam`i ala al-khaddi yajri wa yas-ju", translation: "And my tears on my cheek were running and quiet" },
      { time: 26, text: "Ilahi wa Rabbi `ubaydun faqeer", translation: "My God and my Lord, a needy little servant" },
      { time: 35, text: "Mura-dahu `afwun wa saf-hun jameel", translation: "Whose only desire is Your beautiful pardon and forgiveness" },
      { time: 45, text: "Fa ya Rabbi thabbit `ala al-haqqi qalbi", translation: "So my Lord, keep my heart firm on the truth" },
      { time: 54, text: "Wa ghfir dhunoobi wa sahhil matee", translation: "And forgive my sins and ease my path" }
    ]
  },
  {
    id: '5',
    title: 'Mawlaya',
    artist: 'Maher Zain',
    album: 'Forgive Me',
    duration: 295,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=500&q=80',
    lyrics: [
      { time: 0, text: "♪ (Maher Zain intro harmonies)" },
      { time: 6, text: "Mawlaya salli wa sallim da'iman abadan", translation: "O My Lord, send peace and blessings always and forever" },
      { time: 14, text: "`Ala Habibika Khayril khalqi kullihimi", translation: "Upon Your Beloved, the best of all creation" },
      { time: 22, text: "Mawlaya salli wa sallim da'iman abadan", translation: "O My Lord, send peace and blessings always and forever" },
      { time: 30, text: "`Ala Habibika Khayril khalqi kullihimi", translation: "Upon Your Beloved, the best of all creation" },
      { time: 38, text: "Ya Rabbil Mustafa balligh maqasidana", translation: "O Lord of the Chosen One, let us reach our goals" },
      { time: 46, text: "Wa ghfir lana ma mada, Ya Wasi`al karami", translation: "And forgive our past, O Owner of infinite generosity" }
    ]
  },
  {
    id: '6',
    title: 'Qamarun',
    artist: 'Mustafa Atef',
    album: 'Qamarun Sidna',
    duration: 275,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=500&q=80',
    lyrics: [
      { time: 0, text: "♪ (Bright chanting intro)" },
      { time: 5, text: "Qamarun, Qamarun, Qamarun Sidna Nabi, Qamarun", translation: "Beautiful like a moon, is our master the Prophet" },
      { time: 13, text: "Wa jameel, wa jameel, wa jameel Sidna Nabi, wa jameel", translation: "And elegant, so elegant, is our Prophet Muhammad" },
      { time: 21, text: "Wa kafful Mustafa kal wardi nadi", translation: "And the hand of the Chosen One is like a blooming rose" },
      { time: 28, text: "Wa `itruha yabqa idha massat ayadi", translation: "And its sweet fragrance lingers when touched by hands" },
      { time: 36, text: "Wa `amma nawaluha kullal `ibadi", translation: "And his generosity covers all mankind" },
      { time: 43, text: "Qamarun, Qamarun, Qamarun Sidna Nabi, Qamarun", translation: "Beautiful like a moon, is our master the Prophet" }
    ]
  }
];

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // NEW MODE SEPARATED STATES
  const [activeMode, setActiveModeState] = useState<'nasheed' | 'quran'>('nasheed');
  const [isSwitchingMode, setIsSwitchingMode] = useState<boolean>(false);
  const [activeReciter, setActiveReciterState] = useState<QuranReciter>(PRESET_RECITERS[0]);
  const [quranTracks, setQuranTracks] = useState<Track[]>([]);

  // Sandbox 1: Nasheed States
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [queue, setQueue] = useState<Track[]>(MOCK_TRACKS);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [likes, setLikes] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  // Sandbox 2: Quran States
  const [quranCurrentTrack, setQuranCurrentTrack] = useState<Track | null>(null);
  const [quranIsPlaying, setQuranIsPlaying] = useState<boolean>(false);
  const [quranIsBuffering, setQuranIsBuffering] = useState<boolean>(false);
  const [quranPosition, setQuranPosition] = useState<number>(0);
  const [quranDuration, setQuranDuration] = useState<number>(0);
  const [quranQueue, setQuranQueue] = useState<Track[]>([]);
  const [quranCurrentIndex, setQuranCurrentIndex] = useState<number>(-1);
  const [quranLikes, setQuranLikes] = useState<string[]>([]);
  const [quranHistory, setQuranHistory] = useState<string[]>([]);

  // Layout preference states (OLED theme is AMOLED by default)
  const [themeAccent, setThemeAccent] = useState<ThemeAccent>('amoled');
  const [userName, setUserName] = useState<string>('Guest');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);

  // Mode reference to avoid stale closures in active tickers
  const activeModeRef = useRef<'nasheed' | 'quran'>('nasheed');

  useEffect(() => {
    activeModeRef.current = activeMode;
  }, [activeMode]);

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

    return () => {
      cleanupDrivers();
    };
  }, []);

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
    
    // Automatically swap the current quranQueue to the new reciter's list to maintain next/prev continuity
    setQuranQueue(loadedList);
    
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

    if (mode === 'quran') {
      const loadedList = await loadQuranTracks(activeReciter);
      // Populate active queue with loaded list by default if queue is blank
      if (quranQueue.length === 0) {
        setQuranQueue(loadedList);
      }
    }

    // High fidelity Material switch transition settling time
    setTimeout(() => {
      setIsSwitchingMode(false);
    }, 600);
  };

  const cleanupDrivers = () => {
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
  };

  // Keep track of web time progress
  const startWebTimer = () => {
    if (webTimerRef.current) clearInterval(webTimerRef.current);
    webTimerRef.current = setInterval(() => {
      if (webAudioRef.current && !webAudioRef.current.paused) {
        const pos = Math.floor(webAudioRef.current.currentTime);
        const dur = Math.floor(webAudioRef.current.duration) || 0;

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
    }, 500);
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
          setQuranPosition(Math.floor(currentPos));
          setQuranDuration(Math.floor(totalDuration));
          setQuranIsBuffering(currentBuffering);
        } else {
          setPosition(Math.floor(currentPos));
          setDuration(Math.floor(totalDuration));
          setIsBuffering(currentBuffering);
        }

        if (currentPos >= totalDuration && totalDuration > 0) {
          clearInterval(webTimerRef.current);
          handleTrackFinished();
        }
      }
    }, 500);
  };

  const handleTrackFinished = () => {
    if (isRepeat) {
      seekTo(0);
      resumeAudio();
    } else {
      nextTrack();
    }
  };

  const playTrack = (track: Track) => {
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
        const newQueue = [...quranQueue];
        newQueue.push(track);
        setQuranQueue(newQueue);
        setQuranCurrentIndex(newQueue.length - 1);
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
        const newQueue = [...queue];
        newQueue.push(track);
        setQueue(newQueue);
        setCurrentIndex(newQueue.length - 1);
      }

      setHistory(prev => {
        const filtered = prev.filter(id => id !== track.id);
        return [track.id, ...filtered].slice(0, 10);
      });
    }

    if (Platform.OS === 'web') {
      try {
        const audio = new window.Audio(track.audioUrl);
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
        const player = createAudioPlayer(track.audioUrl);
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
    const isQuran = activeMode === 'quran';
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
        const track = isQuran ? quranCurrentTrack : currentTrack;
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
        const track = isQuran ? quranCurrentTrack : currentTrack;
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
    const isQuran = activeMode === 'quran';
    const activeQueue = isQuran ? quranQueue : queue;
    const activeIndex = isQuran ? quranCurrentIndex : currentIndex;

    if (activeQueue.length === 0) return;

    let nextIndex = activeIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * activeQueue.length);
    } else if (nextIndex >= activeQueue.length) {
      nextIndex = 0; // loop queue
    }

    playTrack(activeQueue[nextIndex]);
  };

  const prevTrack = () => {
    const isQuran = activeMode === 'quran';
    const activeQueue = isQuran ? quranQueue : queue;
    const activeIndex = isQuran ? quranCurrentIndex : currentIndex;

    if (activeQueue.length === 0) return;

    let prevIndex = activeIndex - 1;
    if (prevIndex < 0) {
      prevIndex = activeQueue.length - 1; // loop backwards
    }

    playTrack(activeQueue[prevIndex]);
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

  const toggleLike = (trackId: string) => {
    const isQuran = activeMode === 'quran';
    if (isQuran) {
      setQuranLikes(prev => 
        prev.includes(trackId) 
          ? prev.filter(id => id !== trackId) 
          : [...prev, trackId]
      );
    } else {
      setLikes(prev => 
        prev.includes(trackId) 
          ? prev.filter(id => id !== trackId) 
          : [...prev, trackId]
      );
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
      if (!quranQueue.find(t => t.id === track.id)) {
        setQuranQueue(prev => [...prev, track]);
      }
    } else {
      if (!queue.find(t => t.id === track.id)) {
        setQueue(prev => [...prev, track]);
      }
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

  // Map dynamic values based on the currently active mode sandbox
  const contextTracks = activeMode === 'nasheed' ? MOCK_TRACKS : quranTracks;
  const contextCurrentTrack = activeMode === 'nasheed' ? currentTrack : quranCurrentTrack;
  const contextIsPlaying = activeMode === 'nasheed' ? isPlaying : quranIsPlaying;
  const contextIsBuffering = activeMode === 'nasheed' ? isBuffering : quranIsBuffering;
  const contextPosition = activeMode === 'nasheed' ? position : quranPosition;
  const contextDuration = activeMode === 'nasheed' ? duration : quranDuration;
  const contextQueue = activeMode === 'nasheed' ? queue : quranQueue;
  const contextCurrentIndex = activeMode === 'nasheed' ? currentIndex : quranCurrentIndex;
  const contextLikes = activeMode === 'nasheed' ? likes : quranLikes;
  const contextHistory = activeMode === 'nasheed' ? history : quranHistory;

  return (
    <PlayerContext.Provider
      value={{
        tracks: contextTracks,
        currentTrack: contextCurrentTrack,
        isPlaying: contextIsPlaying,
        isBuffering: contextIsBuffering,
        position: contextPosition,
        duration: contextDuration,
        queue: contextQueue,
        currentIndex: contextCurrentIndex,
        likes: contextLikes,
        history: contextHistory,
        isShuffle,
        isRepeat,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seekTo,
        toggleLike,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
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
      }}
    >
      {children}
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
