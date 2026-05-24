/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { ACCENT_PALETTES, ThemeAccent } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePlayer } from '@/context/player-context';

export function useTheme() {
  const scheme = useColorScheme();
  const systemTheme = scheme === 'unspecified' ? 'light' : scheme;

  let accent: ThemeAccent = 'rose';
  try {
    const player = usePlayer();
    if (player && player.themeAccent) {
      accent = player.themeAccent;
    }
  } catch (e) {
    // Fall back to rose during early loading or when used outside Provider
  }

  const palette = ACCENT_PALETTES[accent] || ACCENT_PALETTES.rose;
  return palette[systemTheme];
}
