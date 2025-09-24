// Legacy theme - DEPRECATED: Use new style system from components.ts and useStyles.ts
// This file is kept for backward compatibility during migration

import { componentStyles } from './components'
import { colors } from './colors'

// Legacy theme object for backward compatibility
export const theme = {
  colors: {
    background: colors.dark.background,
    sidebarBg: colors.dark.sidebarBg,
    cardBg: colors.dark.cardBg,
    border: colors.dark.border,
    borderHover: colors.dark.borderHover,
    primary: colors.primary[500],
    primaryHover: colors.primary[600],
    textPrimary: colors.dark.textPrimary,
    textSecondary: colors.dark.textSecondary,
    textMuted: colors.dark.textMuted,
  },

  styles: {
    // Search Input - now uses componentStyles
    searchContainer: componentStyles.input.search,
    searchInput: componentStyles.input.search,

    // Buttons - now uses componentStyles
    primaryButton: componentStyles.button.primary,
    secondaryButton: componentStyles.button.secondary,

    // Filter Tab - now uses componentStyles
    filterTab: componentStyles.button.ghost,

    // Tag - now uses componentStyles
    tag: componentStyles.tag.base,

    // Card - now uses componentStyles
    card: componentStyles.card.base,

    // Container - now uses componentStyles
    container: componentStyles.container
  }
};

// Legacy helper functions - DEPRECATED: Use useStyles hooks instead
export const getFilterTabStyle = (isActive: boolean) => ({
  ...componentStyles.button.ghost,
  bg: isActive ? colors.primary[500] : 'transparent',
  color: isActive ? 'white' : colors.dark.textSecondary,
  fontWeight: isActive ? '600' : '400',
  _hover: {
    bg: isActive ? colors.primary[600] : colors.dark.border,
    color: isActive ? 'white' : colors.dark.textPrimary
  }
});

export const getIconButtonStyle = (isActive: boolean, activeColor = colors.accent.gold) => ({
  ...componentStyles.button.icon,
  color: isActive ? activeColor : colors.dark.textSecondary,
  _hover: {
    ...componentStyles.button.icon._hover,
    color: isActive ? activeColor : colors.dark.textPrimary
  }
});