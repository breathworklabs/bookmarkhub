import { useMemo } from 'react'
import { componentStyles, getButtonStyle, getCardStyle, getInputStyle, getNavigationStyle, getBadgeStyle, getTagStyle } from '../styles/components'
import { colors } from '../styles/colors'

// Style hooks for consistent component styling

/**
 * Hook for button styles with variants
 */
export const useButtonStyles = (variant: 'primary' | 'secondary' | 'ghost' | 'icon' = 'primary') => {
  return useMemo(() => getButtonStyle(variant), [variant])
}

/**
 * Hook for card styles with state management
 */
export const useCardStyles = (isSelected?: boolean) => {
  return useMemo(() => getCardStyle(isSelected), [isSelected])
}

/**
 * Hook for input styles
 */
export const useInputStyles = (type: 'base' | 'search' = 'base') => {
  return useMemo(() => getInputStyle(type), [type])
}

/**
 * Hook for navigation item styles
 */
export const useNavigationStyles = (isActive: boolean) => {
  return useMemo(() => getNavigationStyle(isActive), [isActive])
}

/**
 * Hook for badge styles
 */
export const useBadgeStyles = (variant: 'base' | 'count' | 'active' | 'error' = 'base') => {
  return useMemo(() => getBadgeStyle(variant), [variant])
}

/**
 * Hook for tag styles
 */
export const useTagStyles = (variant: 'base' | 'active' | 'filter' = 'base') => {
  return useMemo(() => getTagStyle(variant), [variant])
}

/**
 * Hook for container styles
 */
export const useContainerStyles = (type: 'background' | 'sidebar' | 'header' | 'filterBar') => {
  return useMemo(() => componentStyles.container[type], [type])
}

/**
 * Hook for getting theme colors
 */
export const useThemeColors = () => {
  return useMemo(() => colors, [])
}

/**
 * Hook for getting specific color values
 */
export const useColor = (colorPath: string) => {
  return useMemo(() => {
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
  }, [colorPath])
}

/**
 * Hook for icon button styles with state
 */
export const useIconButtonStyles = (isActive?: boolean, activeColor?: string) => {
  return useMemo(() => ({
    ...componentStyles.button.icon,
    color: isActive ? (activeColor || colors.accent.gold) : colors.dark.textSecondary,
    _hover: {
      ...componentStyles.button.icon._hover,
      color: isActive ? (activeColor || colors.accent.gold) : colors.dark.textPrimary
    }
  }), [isActive, activeColor])
}

/**
 * Hook for filter tab styles
 */
export const useFilterTabStyles = (isActive: boolean) => {
  return useMemo(() => ({
    ...componentStyles.button.ghost,
    bg: isActive ? colors.primary[500] : 'transparent',
    color: isActive ? 'white' : colors.dark.textSecondary,
    fontWeight: isActive ? '600' : '400',
    _hover: {
      bg: isActive ? colors.primary[600] : colors.dark.border,
      color: isActive ? 'white' : colors.dark.textPrimary
    }
  }), [isActive])
}

/**
 * Hook for search container styles
 */
export const useSearchContainerStyles = () => {
  return useMemo(() => ({
    bg: colors.dark.cardBg,
    border: '1px solid',
    borderColor: colors.dark.border,
    borderRadius: '20px',
    px: 3,
    py: 2,
    h: '36px',
    _focusWithin: {
      borderColor: colors.primary[500],
      boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.1)'
    }
  }), [])
}

/**
 * Hook for menu item styles
 */
export const useMenuItemStyles = (isDestructive?: boolean) => {
  return useMemo(() => ({
    color: isDestructive ? colors.error[500] : colors.dark.textPrimary,
    _hover: {
      bg: isDestructive ? colors.error[500] : colors.dark.border,
      color: isDestructive ? 'white' : colors.dark.textPrimary
    },
    _focus: {
      bg: isDestructive ? colors.error[500] : colors.dark.border,
      color: isDestructive ? 'white' : colors.dark.textPrimary
    },
    px: 3,
    py: 2,
    fontSize: 'sm',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }), [isDestructive])
}

/**
 * Hook for selection checkbox styles
 */
export const useSelectionStyles = (isSelected: boolean) => {
  return useMemo(() => ({
    w: '20px',
    h: '20px',
    borderRadius: 'full',
    bg: isSelected ? colors.accent.blue : 'rgba(0, 0, 0, 0.7)',
    border: isSelected ? `2px solid ${colors.accent.blue}` : '2px solid rgba(255, 255, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    _hover: {
      bg: isSelected ? colors.accent.blue : 'rgba(74, 158, 255, 0.2)',
      borderColor: colors.accent.blue,
      transform: 'scale(1.05)'
    }
  }), [isSelected])
}
