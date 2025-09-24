// Theme switching system for dark/light mode support

import { colors } from './colors'

// Light theme colors
export const lightThemeColors = {
  // Primary palette (same as dark for brand consistency)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#1d4ed8',
    600: '#1e40af',
    700: '#1d4ed8',
  },

  // Semantic colors
  success: { 500: '#22c55e' },
  warning: { 500: '#f59e0b' },
  error: { 500: '#dc2626' },
  info: { 500: '#3b82f6' },

  // Light theme specific
  light: {
    background: '#ffffff',
    sidebarBg: '#f8fafc',
    cardBg: '#ffffff',
    border: '#e2e8f0',
    borderHover: '#cbd5e1',
    textPrimary: '#1a202c',
    textSecondary: '#4a5568',
    textMuted: '#718096',
  },

  // Accent colors (same as dark)
  accent: {
    blue: '#4a9eff',
    purple: '#8B5CF6',
    gold: '#ffd700'
  }
} as const

// Dark theme colors (existing)
export const darkThemeColors = colors

// Theme type definition
export type ThemeMode = 'light' | 'dark' | 'system'

// Theme configuration
export interface ThemeConfig {
  mode: ThemeMode
  colors: typeof lightThemeColors | typeof darkThemeColors
  isDark: boolean
}

// Default theme configuration
export const defaultThemeConfig: ThemeConfig = {
  mode: 'dark',
  colors: darkThemeColors,
  isDark: true
}

// Theme switching utilities
export const themeUtils = {
  // Get theme colors based on mode
  getThemeColors: (mode: ThemeMode, systemIsDark: boolean = false): typeof lightThemeColors | typeof darkThemeColors => {
    if (mode === 'system') {
      return systemIsDark ? darkThemeColors : lightThemeColors
    }
    return mode === 'dark' ? darkThemeColors : lightThemeColors
  },

  // Check if theme is dark
  isDarkTheme: (mode: ThemeMode, systemIsDark: boolean = false): boolean => {
    if (mode === 'system') {
      return systemIsDark
    }
    return mode === 'dark'
  },

  // Get system theme preference
  getSystemTheme: (): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return true // Default to dark if SSR
  },

  // Apply theme to document
  applyTheme: (isDark: boolean): void => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
    }
  },

  // Listen for system theme changes
  watchSystemTheme: (callback: (isDark: boolean) => void): (() => void) => {
    if (typeof window === 'undefined') return () => {}

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => callback(e.matches)

    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }
}

// Theme-aware color tokens
export const createThemeTokens = (themeColors: typeof lightThemeColors | typeof darkThemeColors) => {
  const isLight = 'light' in themeColors
  const lightColors = isLight ? (themeColors as typeof lightThemeColors).light : null
  const darkColors = isLight ? null : (themeColors as typeof darkThemeColors).dark

  return {
    // Background tokens
    bg: {
      primary: lightColors?.background || darkColors?.background || '#0f1419',
      secondary: lightColors?.sidebarBg || darkColors?.sidebarBg || '#16181c',
      tertiary: lightColors?.cardBg || darkColors?.cardBg || '#1a1d23',
      accent: themeColors.primary[500],
      success: themeColors.success[500],
      warning: themeColors.warning[500],
      error: themeColors.error[500],
      info: themeColors.info[500]
    },

    // Text tokens
    text: {
      primary: lightColors?.textPrimary || darkColors?.textPrimary || '#e1e5e9',
      secondary: lightColors?.textSecondary || darkColors?.textSecondary || '#71767b',
      muted: lightColors?.textMuted || darkColors?.textMuted || '#9ca3af',
      accent: themeColors.accent.blue,
      success: themeColors.success[500],
      warning: themeColors.warning[500],
      error: themeColors.error[500],
      info: themeColors.info[500]
    },

    // Border tokens
    border: {
      primary: lightColors?.border || darkColors?.border || '#2a2d35',
      secondary: lightColors?.borderHover || darkColors?.borderHover || '#3a3d45',
      accent: themeColors.accent.blue,
      success: themeColors.success[500],
      warning: themeColors.warning[500],
      error: themeColors.error[500],
      info: themeColors.info[500]
    },

    // Shadow tokens
    shadow: {
      sm: isLight ? '0 1px 2px rgba(0, 0, 0, 0.05)' : '0 1px 2px rgba(0, 0, 0, 0.3)',
      md: isLight ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 4px 6px rgba(0, 0, 0, 0.4)',
      lg: isLight ? '0 10px 15px rgba(0, 0, 0, 0.1)' : '0 10px 15px rgba(0, 0, 0, 0.5)',
      xl: isLight ? '0 20px 25px rgba(0, 0, 0, 0.1)' : '0 20px 25px rgba(0, 0, 0, 0.6)'
    }
  }
}

// Predefined theme configurations
export const themes = {
  light: {
    mode: 'light' as const,
    colors: lightThemeColors,
    isDark: false,
    tokens: createThemeTokens(lightThemeColors)
  },
  dark: {
    mode: 'dark' as const,
    colors: darkThemeColors,
    isDark: true,
    tokens: createThemeTokens(darkThemeColors)
  }
} as const

// Theme context type for React
export interface ThemeContextType {
  theme: ThemeConfig
  setTheme: (mode: ThemeMode) => void
  toggleTheme: () => void
  tokens: ReturnType<typeof createThemeTokens>
}
