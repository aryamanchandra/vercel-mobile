// Vercel Design System Colors
// Based on https://vercel.com/design

export const colors = {
  // Base colors
  background: '#000000',
  foreground: '#FFFFFF',
  
  // Grays (Vercel's exact gray scale)
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },
  
  // Semantic colors
  border: {
    default: '#333333',
    hover: '#444444',
  },
  
  // Status colors
  success: '#0070F3',
  error: '#E00',
  warning: '#F5A623',
  
  // State colors
  ready: '#0070F3',
  building: '#F5A623',
  queued: '#666666',
  canceled: '#999999',
  
  // Accents
  accent: {
    blue: '#0070F3',
    purple: '#7928CA',
    pink: '#FF0080',
    cyan: '#50E3C2',
    orange: '#F5A623',
    violet: '#7928CA',
  },
  
  // Surfaces
  surface: {
    default: '#000000',
    elevated: '#111111',
    hover: '#1A1A1A',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 5,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  fontFamily: {
    sans: 'Inter_400Regular',
    mono: 'Inter_400Regular',
  },
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

