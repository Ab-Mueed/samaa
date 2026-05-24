import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1C1A11',
    background: '#FFF8F6',
    backgroundElement: '#F4DDDB', // MD3 Surface Variant
    backgroundSelected: '#E8C3C1', // Selected pill back
    textSecondary: '#7A5754',
    primary: '#8F302A', // Deep Red/Brown Shuffle
    onPrimary: '#FFFFFF',
    outline: '#857371',
    playerBackground: '#FFF0EE',
    accentColor: '#8F302A',
    accentContainer: '#FFDAD6',
  },
  dark: {
    text: '#F1DFDD',
    background: '#201A19',
    backgroundElement: '#3B2F2E',
    backgroundSelected: '#534342',
    textSecondary: '#D8C2BF',
    primary: '#FFB4A9',
    onPrimary: '#680005',
    outline: '#A08C8A',
    playerBackground: '#2C2120',
    accentColor: '#FFB4A9',
    accentContainer: '#8F302A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
