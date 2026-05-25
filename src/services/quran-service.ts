import { Track } from '@/context/player-context';

export interface QuranSurah {
  number: number;
  name: string; // Arabic name, e.g., الفاتحة
  englishName: string; // e.g., Al-Fatiha
  englishNameTranslation: string; // e.g., The Opening
  numberOfAyahs: number;
  revelationType: string; // Meccan / Medinan
}

export interface QuranReciter {
  id: string;
  name: string;
  arabicName: string;
  serverUrl: string;
  folderPath: string;
  avatarUrl: any; // Allow local require() or remote uri strings
}

// Preset Renowned Reciters hosted on mp3quran.net CDN
export const PRESET_RECITERS: QuranReciter[] = [
  {
    id: 'alafasy',
    name: 'Mishary Rashid Alafasy',
    arabicName: 'مشاري العفاسي',
    serverUrl: 'https://server8.mp3quran.net',
    folderPath: 'afs',
    avatarUrl: require('../../assets/images/mishary-rashid-alafasy.png')
  },
  {
    id: 'sudais',
    name: 'Abdul Rahman Al-Sudais',
    arabicName: 'عبد الرحمن السديس',
    serverUrl: 'https://server11.mp3quran.net',
    folderPath: 'sds',
    avatarUrl: require('../../assets/images/abdul-rahman-al-sudais.png')
  },
  {
    id: 'maher',
    name: 'Maher Al-Muaiqly',
    arabicName: 'ماهر المعيقلي',
    serverUrl: 'https://server12.mp3quran.net',
    folderPath: 'maher',
    avatarUrl: require('../../assets/images/maher-al-mueaqly.png')
  },
  {
    id: 'ghamdi',
    name: 'Saad Al-Ghamdi',
    arabicName: 'سعد الغامدي',
    serverUrl: 'https://server7.mp3quran.net',
    folderPath: 's_gmd',
    avatarUrl: require('../../assets/images/al-ghamdi.jpg')
  },
  {
    id: 'dosari',
    name: 'Yasser Al-Dosari',
    arabicName: 'ياسر الدوسري',
    serverUrl: 'https://server11.mp3quran.net',
    folderPath: 'yasser',
    avatarUrl: require('../../assets/images/yasser-al-dossari.png')
  }
];

// Cache in-memory to prevent duplicate network hits
let surahCache: QuranSurah[] = [];

export const QuranService = {
  /**
   * Fetch all 114 Surahs with metadata from Al Quran Cloud
   */
  async fetchSurahs(): Promise<QuranSurah[]> {
    if (surahCache.length > 0) {
      return surahCache;
    }

    try {
      const response = await fetch('https://api.alquran.cloud/v1/surah');
      if (!response.ok) {
        throw new Error('Failed to fetch surah list');
      }
      const data = await response.json();
      if (data && data.code === 200 && Array.isArray(data.data)) {
        surahCache = data.data;
        return surahCache;
      }
      throw new Error('Invalid Quran API response shape');
    } catch (error) {
      console.log('Error fetching Surahs', error);
      return [];
    }
  },

  /**
   * Helper to format a Surah into a standard unified Track shape accepted by player views
   */
  transformToTrack(surah: QuranSurah, reciter: QuranReciter): Track {
    const padNumber = (num: number): string => {
      if (num < 10) return `00${num}`;
      if (num < 100) return `0${num}`;
      return `${num}`;
    };

    const paddedNum = padNumber(surah.number);
    const audioUrl = `${reciter.serverUrl}/${reciter.folderPath}/${paddedNum}.mp3`;

    // High-fidelity spiritual backgrounds tailored by reciter
    const getCoverArt = (reciterId: string): string => {
      switch (reciterId) {
        case 'alafasy':
          return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80'; // Intricate Dome
        case 'sudais':
          return 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&q=80'; // Arches
        case 'maher':
          return 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600&q=80'; // Quran scriptures
        case 'dosari':
          return 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&q=80'; // Beautiful arches
        default:
          return 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&q=80'; // Stars / Twilight silhouette
      }
    };

    return {
      id: `quran_${reciter.id}_${surah.number}`,
      title: `Surah ${surah.englishName} (${surah.name})`,
      artist: reciter.name,
      album: `Surah ${surah.englishNameTranslation}`,
      duration: surah.numberOfAyahs * 12, // Initial estimate, dynamic audio duration loader will correct this once buffered!
      audioUrl: audioUrl,
      coverUrl: getCoverArt(reciter.id),
      lyrics: [
        { time: 0, text: `Surah ${surah.englishName} (${surah.name})` },
        { time: 2, text: `Recited beautifully by ${reciter.name}` },
        { time: 5, text: `Revelation: ${surah.revelationType} • Ayahs: ${surah.numberOfAyahs}` },
        { time: 8, text: `Bismillahir Rahmanir Rahim`, translation: `In the name of Allah, the Beneficent, the Merciful` }
      ],
      surahNumber: surah.number,
      surahArabicName: surah.name,
      surahEnglishName: surah.englishName
    };
  }
};
