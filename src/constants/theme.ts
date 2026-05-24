import { Platform } from 'react-native';

export type ThemeAccent = 'rose' | 'teal' | 'purple' | 'indigo' | 'slate' | 'amber';

export const ACCENT_PALETTES: Record<ThemeAccent, {
  light: {
    text: string;
    background: string;
    backgroundElement: string;
    backgroundSelected: string;
    textSecondary: string;
    primary: string;
    onPrimary: string;
    outline: string;
    playerBackground: string;
    accentColor: string;
    accentContainer: string;
  };
  dark: {
    text: string;
    background: string;
    backgroundElement: string;
    backgroundSelected: string;
    textSecondary: string;
    primary: string;
    onPrimary: string;
    outline: string;
    playerBackground: string;
    accentColor: string;
    accentContainer: string;
  };
}> = {
  rose: {
    light: {
      text: '#1C1A11',
      background: '#FFF8F6',
      backgroundElement: '#F4DDDB',
      backgroundSelected: '#E8C3C1',
      textSecondary: '#7A5754',
      primary: '#8F302A',
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
    }
  },
  teal: {
    light: {
      text: '#00201A',
      background: '#E8FAF6',
      backgroundElement: '#CCEBE4',
      backgroundSelected: '#B3DDD4',
      textSecondary: '#3F635C',
      primary: '#006A5C',
      onPrimary: '#FFFFFF',
      outline: '#707976',
      playerBackground: '#DCF5F0',
      accentColor: '#006A5C',
      accentContainer: '#A3F4E3',
    },
    dark: {
      text: '#A3F4E3',
      background: '#00201A',
      backgroundElement: '#1A3F39',
      backgroundSelected: '#29534C',
      textSecondary: '#A2C9C1',
      primary: '#84D8C7',
      onPrimary: '#00372F',
      outline: '#899390',
      playerBackground: '#0B2924',
      accentColor: '#84D8C7',
      accentContainer: '#004F44',
    }
  },
  purple: {
    light: {
      text: '#21102F',
      background: '#FAF6FE',
      backgroundElement: '#EADBFA',
      backgroundSelected: '#DCBEF5',
      textSecondary: '#6C5484',
      primary: '#7E2A8F',
      onPrimary: '#FFFFFF',
      outline: '#7E7289',
      playerBackground: '#F4EBFC',
      accentColor: '#7E2A8F',
      accentContainer: '#F7D6FF',
    },
    dark: {
      text: '#F7D6FF',
      background: '#201129',
      backgroundElement: '#3B204C',
      backgroundSelected: '#502D67',
      textSecondary: '#D6C0E8',
      primary: '#E9B3FF',
      onPrimary: '#4D005C',
      outline: '#9A8AA6',
      playerBackground: '#291739',
      accentColor: '#E9B3FF',
      accentContainer: '#65007A',
    }
  },
  indigo: {
    light: {
      text: '#001A3F',
      background: '#F0F4FA',
      backgroundElement: '#D3E2F4',
      backgroundSelected: '#B5CDE8',
      textSecondary: '#475C7A',
      primary: '#005FAF',
      onPrimary: '#FFFFFF',
      outline: '#727E8C',
      playerBackground: '#E8F1FC',
      accentColor: '#005FAF',
      accentContainer: '#D4E2FF',
    },
    dark: {
      text: '#D4E2FF',
      background: '#001A3F',
      backgroundElement: '#14315C',
      backgroundSelected: '#24457D',
      textSecondary: '#B0C6E8',
      primary: '#A4C8FF',
      onPrimary: '#003163',
      outline: '#8C97A6',
      playerBackground: '#072551',
      accentColor: '#A4C8FF',
      accentContainer: '#004886',
    }
  },
  slate: {
    light: {
      text: '#1A1C1E',
      background: '#F8F9FA',
      backgroundElement: '#DFE2E6',
      backgroundSelected: '#C8CDD4',
      textSecondary: '#5D6065',
      primary: '#4F5E70',
      onPrimary: '#FFFFFF',
      outline: '#7B818A',
      playerBackground: '#ECEFF2',
      accentColor: '#4F5E70',
      accentContainer: '#DFE5EC',
    },
    dark: {
      text: '#E2E2E6',
      background: '#1A1C1E',
      backgroundElement: '#33373B',
      backgroundSelected: '#494E54',
      textSecondary: '#C6C6CA',
      primary: '#B6C8DE',
      onPrimary: '#203244',
      outline: '#8F949C',
      playerBackground: '#222629',
      accentColor: '#B6C8DE',
      accentContainer: '#37485A',
    }
  },
  amber: {
    light: {
      text: '#221B00',
      background: '#FFFBF0',
      backgroundElement: '#F6E6B4',
      backgroundSelected: '#ECCB6E',
      textSecondary: '#665D3C',
      primary: '#785A00',
      onPrimary: '#FFFFFF',
      outline: '#807755',
      playerBackground: '#FFF6D8',
      accentColor: '#785A00',
      accentContainer: '#FFE08B',
    },
    dark: {
      text: '#FFE08B',
      background: '#221B00',
      backgroundElement: '#473600',
      backgroundSelected: '#614B00',
      textSecondary: '#DCC389',
      primary: '#FABF14',
      onPrimary: '#3F2E00',
      outline: '#9D9169',
      playerBackground: '#352902',
      accentColor: '#FABF14',
      accentContainer: '#5C4400',
    }
  }
};

export const Colors = ACCENT_PALETTES.rose;

export type ThemeColor = keyof typeof Colors.light;

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
