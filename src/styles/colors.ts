// Enhanced color palette with semantic tokens
export const colors = {
  // Primary palette
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#1d4ed8', // Current primary
    600: '#1e40af', // Current primaryHover
    700: '#1d4ed8',
    800: '#1e3a8a',
    900: '#1e3a8a',
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#dc2626',
    600: '#b91c1c',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
  },

  // Neutral grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Dark theme specific colors (now using CSS variables)
  dark: {
    background: 'var(--color-bg-primary)',
    sidebarBg: 'var(--color-bg-secondary)',
    cardBg: 'var(--color-bg-tertiary)',
    border: 'var(--color-border)',
    borderHover: 'var(--color-border-hover)',
    textPrimary: 'var(--color-text-primary)',
    textSecondary: 'var(--color-text-tertiary)',
    textMuted: 'var(--color-text-secondary)',
  },

  // Light theme colors (for future theme switching)
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

  // Special colors
  accent: {
    blue: '#4a9eff',
    purple: '#8b5cf6',
    gold: '#ffd700',
  },
}

// Color utility functions
export const getColorValue = (colorPath: string): string => {
  const keys = colorPath.split('.')
  let value: any = colors

  for (const key of keys) {
    value = value[key]
    if (value === undefined) {
      console.warn(`Color path "${colorPath}" not found`)
      return '#000000'
    }
  }

  return value
}

// Theme-aware color getter
export const getThemeColor = (
  colorPath: string,
  isDark: boolean = true
): string => {
  const theme = isDark ? 'dark' : 'light'
  return getColorValue(`${theme}.${colorPath}`)
}
