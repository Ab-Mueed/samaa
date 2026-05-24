import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { createAudioPlayer } from 'expo-audio';

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
}

export const MOCK_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Hasbi Rabbi',
    artist: 'Sami Yusuf',
    album: 'Al-Mu`allim',
    duration: 247,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80',
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
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80',
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
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80',
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
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
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
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80',
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
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
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
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [queue, setQueue] = useState<Track[]>(MOCK_TRACKS);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [likes, setLikes] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);

  // Audio Driver references
  const nativePlayerRef = useRef<any>(null);
  const webAudioRef = useRef<HTMLAudioElement | null>(null);
  const webTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      // Clean up audio drivers on unmount
      cleanupDrivers();
    };
  }, []);

  const cleanupDrivers = () => {
    // Clean Web audio
    if (webAudioRef.current) {
      webAudioRef.current.pause();
      webAudioRef.current = null;
    }
    if (webTimerRef.current) {
      clearInterval(webTimerRef.current);
      webTimerRef.current = null;
    }

    // Clean Native audio using the modern release() API
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
        setPosition(Math.floor(webAudioRef.current.currentTime));
        setDuration(Math.floor(webAudioRef.current.duration) || 0);
        setIsBuffering(false);

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
        // Read directly from the AudioPlayer instance properties
        const currentPos = player.currentTime || 0;
        const totalDuration = player.duration || 0;
        const currentBuffering = player.isBuffering || false;

        setPosition(Math.floor(currentPos));
        setDuration(Math.floor(totalDuration));
        setIsBuffering(currentBuffering);

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
    setCurrentTrack(track);
    setPosition(0);
    setDuration(track.duration);
    setIsPlaying(true);
    setIsBuffering(true);

    // Track index matching
    const qIndex = queue.findIndex(t => t.id === track.id);
    if (qIndex !== -1) {
      setCurrentIndex(qIndex);
    } else {
      // If played track is not in queue, add it to queue and play
      const newQueue = [...queue];
      newQueue.push(track);
      setQueue(newQueue);
      setCurrentIndex(newQueue.length - 1);
    }

    // Add to history (limit to 10 tracks, prevent consecutive duplicates)
    setHistory(prev => {
      const filtered = prev.filter(id => id !== track.id);
      return [track.id, ...filtered].slice(0, 10);
    });

    if (Platform.OS === 'web') {
      try {
        const audio = new window.Audio(track.audioUrl);
        audio.play().then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
          startWebTimer();
        }).catch((err) => {
          console.log('Autoplay failed, waiting user interaction', err);
          setIsPlaying(true);
          setIsBuffering(false);
          startWebTimer();
        });
        webAudioRef.current = audio;
      } catch (e) {
        console.log('Web audio load failed, fallback mock', e);
        mockPlayTimer(track.duration);
      }
    } else {
      try {
        // createAudioPlayer takes the remote URL string directly in expo-audio
        const player = createAudioPlayer(track.audioUrl);
        player.play();
        nativePlayerRef.current = player;
        setIsPlaying(true);
        startNativeTimer(player);
      } catch (err) {
        console.log('Native playback loading failed, running mock', err);
        mockPlayTimer(track.duration);
      }
    }
  };

  // Mock play timer for environments with no audio capability
  const mockPlayTimer = (trackDuration: number) => {
    setIsBuffering(false);
    if (webTimerRef.current) clearInterval(webTimerRef.current);
    webTimerRef.current = setInterval(() => {
      setPosition(prev => {
        if (prev >= trackDuration) {
          clearInterval(webTimerRef.current);
          handleTrackFinished();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const resumeAudio = () => {
    setIsPlaying(true);
    if (Platform.OS === 'web') {
      setIsBuffering(false);
      if (webAudioRef.current) {
        webAudioRef.current.play().catch(e => console.log(e));
        startWebTimer();
      } else if (currentTrack) {
        mockPlayTimer(currentTrack.duration);
      }
    } else {
      if (nativePlayerRef.current) {
        setIsBuffering(nativePlayerRef.current.isBuffering || false);
        nativePlayerRef.current.play();
        startNativeTimer(nativePlayerRef.current);
      } else if (currentTrack) {
        mockPlayTimer(currentTrack.duration);
      }
    }
  };

  const pauseAudio = () => {
    setIsPlaying(false);
    setIsBuffering(false);
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
    if (!currentTrack) {
      if (queue.length > 0) {
        playTrack(queue[0]);
      }
      return;
    }

    if (isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  const nextTrack = () => {
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      nextIndex = 0; // loop queue
    }

    playTrack(queue[nextIndex]);
  };

  const prevTrack = () => {
    if (queue.length === 0) return;

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1; // loop backwards
    }

    playTrack(queue[prevIndex]);
  };

  const seekTo = (seconds: number) => {
    setPosition(seconds);
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
    setLikes(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId) 
        : [...prev, trackId]
    );
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const addToQueue = (track: Track) => {
    if (!queue.find(t => t.id === track.id)) {
      setQueue(prev => [...prev, track]);
    }
  };

  const playAll = (trackList: Track[], startIndex = 0) => {
    setQueue(trackList);
    if (trackList.length > 0) {
      playTrack(trackList[startIndex]);
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <PlayerContext.Provider
      value={{
        tracks: MOCK_TRACKS,
        currentTrack,
        isPlaying,
        isBuffering,
        position,
        duration,
        queue,
        currentIndex,
        likes,
        history,
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
