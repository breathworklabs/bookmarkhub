import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

interface ThemeContextType {
  theme: 'dark' | 'light' | 'auto'
  effectiveTheme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light' | 'auto') => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const theme = useSettingsStore((state) => state.display.theme)
  const setTheme = useSettingsStore((state) => state.setTheme)

  // Get effective theme (resolve 'auto' to 'dark' or 'light')
  const getEffectiveTheme = (): 'dark' | 'light' => {
    if (theme === 'auto') {
      // Check system preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      }
      return 'dark' // Default to dark if we can't detect
    }
    return theme
  }

  const effectiveTheme = getEffectiveTheme()

  // Toggle between light and dark (ignores auto)
  const toggleTheme = () => {
    const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', effectiveTheme)
    root.style.colorScheme = effectiveTheme

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        effectiveTheme === 'dark' ? '#0a0e1a' : '#ffffff'
      )
    }
  }, [effectiveTheme])

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (theme !== 'auto') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const newTheme = mediaQuery.matches ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', newTheme)
      document.documentElement.style.colorScheme = newTheme
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return (
    <ThemeContext.Provider
      value={{ theme, effectiveTheme, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
