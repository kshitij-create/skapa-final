export const COLORS = {
  // Base surfaces
  background: '#050505',
  backgroundElevated: '#0a0a0d',
  surface: '#0c0806', // onboarding canvas
  surfaceRaised: '#111114',
  surfaceLight: 'rgba(255, 255, 255, 0.03)',
  surfaceLighter: 'rgba(255, 255, 255, 0.06)',
  surfaceHover: 'rgba(255, 255, 255, 0.08)',

  // Text
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.72)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  textSubtle: 'rgba(255, 255, 255, 0.38)',
  textFaint: 'rgba(255, 255, 255, 0.22)',

  // Borders / dividers
  border: 'rgba(255, 255, 255, 0.06)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',

  // Brand (refined warm amber)
  primary: '#ffae45',
  primaryDark: '#f05c00',
  primaryLight: '#ffd29a',
  accent: '#ff8a00',
  accentGlow: '#ff6a00',
  accentSoft: 'rgba(255, 138, 0, 0.14)',
  accentTint: '#2a1a10',
  accentHighlight: '#ffd685',

  // Semantic
  secondary: '#3b82f6',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f97316',

  // Mood palette (for map / profile)
  moodNight: '#8A2BE2',
  moodFocus: '#00E5FF',
  moodHype: '#f97316',
  moodMelancholy: '#64748b',
  moodChill: '#0ea5e9',
};

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
  pill: 9999,
};

// Typography scale — blends tight display weights with airy body
export const TYPO = {
  display: {
    fontSize: 34,
    fontWeight: '600' as const,
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  subhead: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: -0.1,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 18,
  },
  overline: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
    lineHeight: 14,
  },
};

export const SHADOWS = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  glow: {
    shadowColor: '#ff8a00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  lifted: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 14,
  },
};
