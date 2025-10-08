import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ThemeMode,
  ThemeConfig,
  themeUtils,
  createThemeTokens,
  ThemeContextType
} from '../styles/themes'

// Custom hook for theme management
export const useTheme = (): ThemeContextType => {
  // Get initial theme from consolidated localStorage or default to dark
  const getInitialTheme = (): ThemeMode => {
    if (typeof window === 'undefined') return 'dark'

    try {
      const data = localStorage.getItem('x-bookmark-manager-data')
      if (data) {
        const parsed = JSON.parse(data)
        const theme = parsed?.settings?.theme
        if (theme && ['light', 'dark', 'system'].includes(theme)) {
          return theme as ThemeMode
        }
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

  // Save theme to consolidated localStorage
  const saveTheme = useCallback((newMode: ThemeMode) => {
    try {
      const data = localStorage.getItem('x-bookmark-manager-data')
      if (data) {
        const parsed = JSON.parse(data)
        parsed.settings.theme = newMode
        localStorage.setItem('x-bookmark-manager-data', JSON.stringify(parsed))
      }
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
