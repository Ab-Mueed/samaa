import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

export interface LyricLine {
  time: number;
  text: string;
  translation?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  audioUrl: string;
  coverUrl: string;
  lyrics: LyricLine[];
}

// Resolve the local backend server IP address dynamically
const getBackendUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://127.0.0.1:8000';
  }
  
  // For simulators and emulators, force direct localhost loopback ports
  if (!Device.isDevice) {
    return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';
  }

  // Only for physical devices, dynamically resolve the host local LAN IP
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip) {
      return `http://${ip}:8000`;
    }
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';
};

const BASE_URL = getBackendUrl();

export const NasheedService = {
  /**
   * Fetch trending/popular nasheeds from local backend.
   */
  async fetchTrending(limit = 15): Promise<Track[]> {
    try {
      const url = `${BASE_URL}/trending?limit=${limit}`;
      console.log(`[NasheedService] Fetching trending: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch trending, status: ${response.status}`);
      }
      const json = await response.json();
      console.log(`[NasheedService] Trending fetch success:`, json.success);
      if (json && json.success && Array.isArray(json.data)) {
        return json.data.map((item: any) => this.transformToTrack(item, 'Trending Nasheed'));
      }
      throw new Error('Invalid schema shape');
    } catch (e) {
      console.log('[NasheedService] Error fetching trending nasheeds:', e);
      return [];
    }
  },

  /**
   * Search YouTube for nasheeds via local backend.
   */
  async search(query: string): Promise<Track[]> {
    if (!query.trim()) return [];
    try {
      const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}`;
      console.log(`[NasheedService] Searching: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`);
      }
      const json = await response.json();
      console.log(`[NasheedService] Search response success:`, json.success);
      if (json && json.success && Array.isArray(json.data)) {
        return json.data.map((item: any) => this.transformToTrack(item, 'Search Result'));
      }
      throw new Error('Invalid search response');
    } catch (e) {
      console.log('[NasheedService] Error searching nasheeds:', e);
      return [];
    }
  },

  /**
   * Fetch a fresh audio streaming URL for a specific video ID.
   */
  async fetchStreamUrl(videoId: string): Promise<string> {
    try {
      const response = await fetch(`${BASE_URL}/stream/${videoId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stream URL');
      }
      const json = await response.json();
      if (json && json.success && json.data && json.data.stream_url) {
        return json.data.stream_url;
      }
      throw new Error('Stream URL missing');
    } catch (e) {
      console.log(`Error resolving stream URL for ${videoId}`, e);
      return '';
    }
  },

  /**
   * Transform backend item schema into unified Track interface.
   */
  transformToTrack(item: any, albumName: string): Track {
    return {
      id: item.youtube_id,
      title: item.title,
      artist: item.channel,
      album: albumName,
      duration: item.duration || 0,
      audioUrl: '', // Will be dynamically loaded on playback start
      coverUrl: item.thumbnail || 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=500&q=80',
      lyrics: [
        { time: 0, text: item.title },
        { time: 3, text: `Channel: ${item.channel}` },
        { time: 6, text: `Duration: ${Math.floor((item.duration || 0) / 60)}m ${Math.floor((item.duration || 0) % 60)}s` }
      ]
    };
  }
};
