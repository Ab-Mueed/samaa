import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Track } from '@/context/player-context';
import { Spacing } from '@/constants/theme';

interface TrackImageProps {
  track: Track | null;
  style: any;
  transition?: number;
}

export function TrackImage({ track, style, transition }: TrackImageProps) {
  if (!track) {
    return <View style={[style, { backgroundColor: '#1A1C1E' }]} />;
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
          backgroundColor: '#0F1A15', // Deep luxurious spiritual emerald dark green
          borderColor: '#D4AF37', // Gold metallic color
          borderWidth: isLarge ? 2.5 : 1,
        }
      ]}>
        {/* Sacred Geometry / Corner Accents for large album arts */}
        {isLarge && (
          <>
            <View style={[styles.cornerAccent, { top: 6, left: 6, borderTopWidth: 1.5, borderLeftWidth: 1.5 }]} />
            <View style={[styles.cornerAccent, { top: 6, right: 6, borderTopWidth: 1.5, borderRightWidth: 1.5 }]} />
            <View style={[styles.cornerAccent, { bottom: 6, left: 6, borderBottomWidth: 1.5, borderLeftWidth: 1.5 }]} />
            <View style={[styles.cornerAccent, { bottom: 6, right: 6, borderBottomWidth: 1.5, borderRightWidth: 1.5 }]} />
          </>
        )}

        <View style={styles.content}>
          {/* Top Surah Number Badge */}
          {isLarge ? (
            <View style={styles.numberBadge}>
              <Text style={styles.numberBadgeText}>{surahNum}</Text>
            </View>
          ) : (
            <Text style={styles.smallNumber}>#{surahNum}</Text>
          )}

          {/* Elegant Arabic Text */}
          <Text style={[
            styles.arabicText, 
            { 
              fontSize: isLarge ? Math.floor(width * 0.12) : Math.floor(width * 0.20),
              marginTop: isLarge ? Spacing.two : Spacing.half,
            }
          ]} numberOfLines={1}>
            {arabicName}
          </Text>

          {/* English Surah Name */}
          <Text style={[
            styles.englishText, 
            { 
              fontSize: isLarge ? Math.floor(width * 0.075) : Math.floor(width * 0.14),
              fontWeight: '800',
              marginTop: isLarge ? 4 : 0,
            }
          ]} numberOfLines={1}>
            {englishName}
          </Text>

          {/* Translation/Subtext for maximized player */}
          {isLarge && (
            <Text style={styles.translationText} numberOfLines={1}>
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    height: '90%',
  },
  cornerAccent: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: '#D4AF3780',
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderColor: '#D4AF3780',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.half,
  },
  numberBadgeText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: 'bold',
  },
  smallNumber: {
    color: '#D4AF37CC',
    fontSize: 8,
    fontWeight: '800',
    marginBottom: 1,
  },
  arabicText: {
    color: '#E5C158', // High-fidelity bright gold
    fontFamily: Platform.OS === 'ios' ? 'Traditional Arabic' : 'serif',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  englishText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  translationText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
