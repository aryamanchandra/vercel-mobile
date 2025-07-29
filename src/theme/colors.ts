// Vercel Design System (Geist) Color Palette
export const colors = {
  // Backgrounds
  background: '#0a0a0a',        // Main background (easier on eyes than pure black)
  backgroundElevated: '#111',   // Cards and elevated surfaces
  backgroundHover: '#141414',   // Hover state for cards
  
  // Foreground
  foreground: '#ededed',        // Primary text (not pure white)
  foregroundMuted: '#a1a1a1',   // Secondary text
  
  // Borders
  border: {
    default: '#1a1a1a',         // Subtle borders
    hover: '#262626',           // Hover state
    focus: '#333',              // Focus state
  },
  
  // Gray scale (Vercel's actual grays)
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  
  // Accent colors
  accent: {
    blue: '#0070f3',
    blueHover: '#3291ff',
    purple: '#7928ca',
    pink: '#ff0080',
    cyan: '#50e3c2',
    orange: '#f5a623',
    violet: '#8b5cf6',
  },
  
  // Status colors (Vercel style)
  success: '#0070f3',           // Vercel uses blue for success
  successBg: 'rgba(0, 112, 243, 0.1)',
  warning: '#f5a623',           // Amber
  warningBg: 'rgba(245, 166, 35, 0.1)',
  error: '#ff1a1a',            // Bright red
  errorBg: 'rgba(255, 26, 26, 0.1)',
  
  // Interactive states
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  hover: 'rgba(255, 255, 255, 0.05)',
  press: 'rgba(255, 255, 255, 0.1)',
  
  // Semantic colors
  link: '#0070f3',
  linkHover: '#3291ff',
};

// Spacing scale (4px base unit)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  xxxxl: 48,
};

// Border radius
export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Typography scale
export const typography = {
  sizes: {
    xs: 11,
    sm: 12,
    base: 13,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    xxxxl: 28,
    xxxxxl: 32,
    display: 40,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tighter: -0.05,
    tight: -0.03,
    normal: -0.02,
    wide: 0.02,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Shadows
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

// Animation durations (ms)
export const animations = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500,
};
