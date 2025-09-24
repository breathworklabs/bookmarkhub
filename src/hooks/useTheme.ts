import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ThemeMode,
  ThemeConfig,
  themeUtils,
  createThemeTokens,
  ThemeContextType
} from '../styles/themes'

// Theme storage key
const THEME_STORAGE_KEY = 'bookmark-manager-theme'

// Custom hook for theme management
export const useTheme = (): ThemeContextType => {
  // Get initial theme from localStorage or default to dark
  const getInitialTheme = (): ThemeMode => {
    if (typeof window === 'undefined') return 'dark'

    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored as ThemeMode
      }
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error)
    }

    return 'dark'
  }

  const [mode, setMode] = useState<ThemeMode>(getInitialTheme)
  const [systemIsDark, setSystemIsDark] = useState(themeUtils.getSystemTheme())

  // Update system theme preference
  useEffect(() => {
    const unwatch = themeUtils.watchSystemTheme((isDark) => {
      setSystemIsDark(isDark)
    })

    return unwatch
  }, [])

  // Save theme to localStorage
  const saveTheme = useCallback((newMode: ThemeMode) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newMode)
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }, [])

  // Set theme mode
  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode)
    saveTheme(newMode)
  }, [saveTheme])

  // Toggle between light and dark (ignores system)
  const toggleTheme = useCallback(() => {
    const newMode = mode === 'dark' ? 'light' : 'dark'
    setTheme(newMode)
  }, [mode, setTheme])

  // Calculate current theme configuration
  const theme = useMemo((): ThemeConfig => {
    const isDark = themeUtils.isDarkTheme(mode, systemIsDark)
    const colors = themeUtils.getThemeColors(mode, systemIsDark)

    return {
      mode,
      colors,
      isDark
    }
  }, [mode, systemIsDark])

  // Create theme tokens
  const tokens = useMemo(() => createThemeTokens(theme.colors), [theme.colors])

  // Apply theme to document
  useEffect(() => {
    themeUtils.applyTheme(theme.isDark)
  }, [theme.isDark])

  return {
    theme,
    setTheme,
    toggleTheme,
    tokens
  }
}

// Hook for getting current theme colors
export const useThemeColors = () => {
  const { theme } = useTheme()
  return theme.colors
}

// Hook for getting theme tokens
export const useThemeTokens = () => {
  const { tokens } = useTheme()
  return tokens
}

// Hook for checking if current theme is dark
export const useIsDarkTheme = () => {
  const { theme } = useTheme()
  return theme.isDark
}

// Hook for theme-aware color values
export const useThemeColor = (lightColor: string, darkColor: string) => {
  const isDark = useIsDarkTheme()
  return isDark ? darkColor : lightColor
}

// Hook for theme-aware styles
export const useThemeStyles = <T>(lightStyles: T, darkStyles: T): T => {
  const isDark = useIsDarkTheme()
  return isDark ? darkStyles : lightStyles
}
