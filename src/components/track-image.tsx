import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Track } from '@/context/player-context';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface TrackImageProps {
  track: Track | null;
  style: any;
  transition?: number;
}

export function TrackImage({ track, style, transition }: TrackImageProps) {
  const theme = useTheme();

  if (!track) {
    return <View style={[style, { backgroundColor: theme.backgroundElement }]} />;
  }

  // Flatten style to read dimensions easily
  const flatStyle = StyleSheet.flatten(style) || {};
  const width = flatStyle.width || 50;
  const height = flatStyle.height || 50;
  const borderRadius = flatStyle.borderRadius || 8;

  const isQuran = track.id?.startsWith('quran_') || !!track.surahNumber;

  if (isQuran) {
    // Parse Quran metadata in case they are missing
    let surahNum = track.surahNumber;
    let arabicName = track.surahArabicName;
    let englishName = track.surahEnglishName;

    if (!surahNum || !arabicName || !englishName) {
      // Fallback string parsing if metadata was not loaded
      // Title format: "Surah Al-Fatiha (الفاتحة)"
      const title = track.title || '';
      const match = title.match(/Surah\s+([^(]+)\s*\(([^)]+)\)/i);
      if (match) {
        englishName = match[1].trim();
        arabicName = match[2].trim();
      } else {
        englishName = title.replace('Surah', '').trim();
        arabicName = 'القرآن';
      }
      
      const parts = track.id?.split('_') || [];
      surahNum = parts.length >= 3 ? parseInt(parts[2], 10) : 1;
    }

    const isLarge = width >= 120;

    return (
      <View style={[
        styles.quranCover, 
        { 
          width, 
          height, 
          borderRadius, 
          backgroundColor: theme.backgroundElement,
          borderColor: theme.outline + '20',
          borderWidth: 1,
        }
      ]}>
        <View style={styles.content}>
          {/* Top Surah Number Badge */}
          {isLarge ? (
            <View style={[styles.numberBadge, { borderColor: theme.outline + '40' }]}>
              <Text style={[styles.numberBadgeText, { color: theme.primary }]}>{surahNum}</Text>
            </View>
          ) : (
            <Text style={[styles.smallNumber, { color: theme.textSecondary }]}>#{surahNum}</Text>
          )}

          {/* Elegant Arabic Text */}
          <Text style={[
            styles.arabicText, 
            { 
              fontSize: isLarge ? Math.floor(width * 0.14) : Math.floor(width * 0.22),
              color: theme.text,
              marginTop: isLarge ? Spacing.two : Spacing.half,
            }
          ]} numberOfLines={1}>
            {arabicName}
          </Text>

          {/* English Surah Name */}
          <Text style={[
            styles.englishText, 
            { 
              fontSize: isLarge ? Math.floor(width * 0.08) : Math.floor(width * 0.14),
              color: theme.primary,
              fontWeight: '700',
              marginTop: isLarge ? 4 : 0,
            }
          ]} numberOfLines={1}>
            {englishName}
          </Text>

          {/* Translation/Subtext for maximized player */}
          {isLarge && (
            <Text style={[styles.translationText, { color: theme.textSecondary }]} numberOfLines={1}>
              {track.album?.replace('Surah', '').trim()}
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Fallback to standard Image component for Nasheeds
  return <Image source={track.coverUrl ? { uri: track.coverUrl } : undefined} style={style} transition={transition} />;
}

const styles = StyleSheet.create({
  quranCover: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    height: '90%',
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.half,
  },
  numberBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  smallNumber: {
    fontSize: 8,
    fontWeight: '800',
    marginBottom: 1,
  },
  arabicText: {
    fontFamily: Platform.OS === 'ios' ? 'Traditional Arabic' : 'serif',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  englishText: {
    textAlign: 'center',
  },
  translationText: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.7,
  },
});

