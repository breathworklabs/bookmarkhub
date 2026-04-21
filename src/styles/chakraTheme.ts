import { createSystem, defaultConfig } from '@chakra-ui/react'
import { colors } from './colors'
import { breakpoints } from './responsive'

// Chakra UI v3 theme configuration
export const chakraTheme = createSystem(defaultConfig, {
  theme: {
    breakpoints,
    tokens: {
      colors: {
        // Primary colors - simplified for Chakra v3 compatibility
        primary: {
          value: colors.primary[500],
        },

        // Semantic colors
        success: {
          value: colors.success[500],
        },
        warning: {
          value: colors.warning[500],
        },
        error: {
          value: colors.error[500],
        },
        info: {
          value: colors.info[500],
        },

        // Gray scale - use standard Chakra gray
        gray: {
          50: { value: colors.gray[50] },
          100: { value: colors.gray[100] },
          800: { value: colors.gray[800] },
          900: { value: colors.gray[900] },
          950: { value: colors.gray[950] },
        },
      },

      // Spacing tokens
      spacing: {
        xs: { value: '0.25rem' },
        sm: { value: '0.5rem' },
        md: { value: '1rem' },
        lg: { value: '1.5rem' },
        xl: { value: '2rem' },
        '2xl': { value: '3rem' },
        '3xl': { value: '4rem' },
      },

      // Border radius tokens
      radii: {
        sm: { value: '0.25rem' },
        md: { value: '0.5rem' },
        lg: { value: '0.75rem' },
        xl: { value: '1rem' },
        '2xl': { value: '1.5rem' },
        full: { value: '9999px' },
      },

      // Font size tokens
      fontSizes: {
        xs: { value: '0.75rem' },
        sm: { value: '0.875rem' },
        md: { value: '1rem' },
        lg: { value: '1.125rem' },
        xl: { value: '1.25rem' },
        '2xl': { value: '1.5rem' },
        '3xl': { value: '1.875rem' },
      },

      // Font weight tokens
      fontWeights: {
        normal: { value: '400' },
        medium: { value: '500' },
        semibold: { value: '600' },
        bold: { value: '700' },
      },

      // Line height tokens
      lineHeights: {
        tight: { value: '1.25' },
        normal: { value: '1.5' },
        relaxed: { value: '1.75' },
      },
    },

    semanticTokens: {
      colors: {
        // Background colors
        'bg.primary': {
          value: colors.dark.background,
        },
        'bg.secondary': {
          value: colors.dark.cardBg,
        },
        'bg.sidebar': {
          value: colors.dark.sidebarBg,
        },

        // Text colors
        'text.primary': {
          value: colors.dark.textPrimary,
        },
        'text.secondary': {
          value: colors.dark.textSecondary,
        },
        'text.muted': {
          value: colors.dark.textMuted,
        },

        // Border colors
        'border.primary': {
          value: colors.dark.border,
        },
        'border.hover': {
          value: colors.dark.borderHover,
        },
      },
    },
  },
})

// Export the theme for use in the app
export default chakraTheme
