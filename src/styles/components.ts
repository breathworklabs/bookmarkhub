import { colors } from './colors'

// Component style variants
export const componentStyles = {
  button: {
    primary: {
      bg: colors.primary[500],
      color: 'white',
      fontSize: '14px',
      fontWeight: '600',
      px: 4,
      py: 2,
      borderRadius: '12px',
      _hover: {
        bg: colors.primary[600],
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)'
      },
      _active: {
        bg: colors.primary[700],
        transform: 'translateY(0)'
      },
      _focus: {
        boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.3)',
        outline: 'none'
      },
      transition: 'all 0.2s ease',
      gap: 2
    },

    secondary: {
      variant: 'outline' as const,
      bg: 'transparent',
      border: '1px solid',
      borderColor: colors.dark.border,
      color: colors.dark.textSecondary,
      fontSize: '14px',
      fontWeight: '500',
      px: 4,
      py: 2,
      borderRadius: '12px',
      _hover: {
        bg: colors.dark.cardBg,
        color: colors.dark.textPrimary,
        borderColor: colors.dark.borderHover,
        transform: 'translateY(-1px)'
      },
      _active: {
        bg: colors.dark.border,
        transform: 'translateY(0)'
      },
      _focus: {
        boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.2)',
        outline: 'none'
      },
      transition: 'all 0.2s ease',
      gap: 2
    },

    ghost: {
      variant: 'ghost' as const,
      bg: 'transparent',
      color: colors.dark.textSecondary,
      fontSize: '14px',
      fontWeight: '500',
      px: 4,
      py: 2,
      borderRadius: '12px',
      _hover: {
        bg: colors.dark.border,
        color: colors.dark.textPrimary
      },
      _active: {
        bg: colors.dark.borderHover
      },
      _focus: {
        boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.2)',
        outline: 'none'
      },
      transition: 'all 0.2s ease'
    },

    icon: {
      variant: 'ghost' as const,
      size: 'sm' as const,
      color: colors.dark.textSecondary,
      borderRadius: 'full',
      w: '32px',
      h: '32px',
      minW: '32px',
      border: '1px solid',
      borderColor: colors.dark.border,
      _hover: {
        bg: colors.dark.border,
        color: colors.dark.textPrimary,
        borderColor: colors.dark.borderHover,
        transform: 'scale(1.1)'
      },
      _active: {
        bg: colors.dark.borderHover,
        transform: 'scale(0.95)'
      },
      _focus: {
        boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.2)',
        outline: 'none'
      },
      transition: 'all 0.2s ease'
    }
  },

  card: {
    base: {
      bg: colors.dark.cardBg,
      borderWidth: '1px',
      borderColor: colors.dark.border,
      borderRadius: '16px',
      p: 4,
      transition: 'all 0.2s ease',
      _hover: {
        borderColor: colors.accent.blue,
        transform: 'translateY(-1px)',
        boxShadow: '0 8px 20px var(--color-card-shadow)',
        bg: colors.dark.sidebarBg
      }
    },

    selected: {
      bg: 'linear-gradient(135deg, rgba(74, 158, 255, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)',
      borderColor: colors.accent.blue,
      boxShadow: '0 0 0 1px rgba(74, 158, 255, 0.3)',
      borderRadius: '16px',
      p: 4,
      transition: 'all 0.2s ease',
      _hover: {
        bg: 'linear-gradient(135deg, rgba(74, 158, 255, 0.15) 0%, rgba(29, 78, 216, 0.08) 100%)',
        borderColor: colors.accent.blue,
        transform: 'translateY(-1px)',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)'
      }
    }
  },

  input: {
    base: {
      bg: colors.dark.cardBg,
      border: '1px solid',
      borderColor: colors.dark.border,
      color: colors.dark.textPrimary,
      fontSize: '14px',
      fontWeight: '400',
      _placeholder: {
        color: colors.dark.textSecondary
      },
      _hover: {
        borderColor: colors.dark.borderHover
      },
      _focus: {
        borderColor: colors.primary[500],
        boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.1)',
        outline: 'none'
      },
      transition: 'all 0.2s ease'
    },

    search: {
      bg: 'transparent',
      border: 'none',
      outline: 'none',
      color: colors.dark.textPrimary,
      fontSize: '14px',
      fontWeight: '400',
      _placeholder: {
        color: colors.dark.textSecondary
      },
      _focus: {
        outline: 'none',
        boxShadow: 'none'
      },
      flex: 1
    }
  },

  navigation: {
    item: {
      p: 3,
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: 'var(--color-text-secondary)',
      transition: 'all 0.2s ease',
      _hover: {
        bg: 'var(--color-bg-hover)',
        color: 'var(--color-blue)'
      },
      _focus: {
        boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.2)',
        outline: 'none'
      }
    },

    active: {
      bg: 'var(--color-blue)',
      color: 'white',
      fontWeight: '600',
      _hover: {
        bg: 'var(--color-blue-hover)',
        color: 'white'
      },
      _focus: {
        boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.4)',
        outline: 'none'
      }
    }
  },

  badge: {
    base: {
      borderRadius: 'full',
      fontSize: 'xs',
      fontWeight: '500',
      px: 2,
      py: 1
    },

    count: {
      bg: colors.dark.border,
      color: colors.dark.textSecondary,
      fontSize: '11px',
      px: 2,
      py: 1,
      borderRadius: '6px'
    },

    active: {
      bg: 'rgba(255,255,255,0.2)',
      color: 'white'
    },

    error: {
      bg: colors.error[500],
      color: 'white',
      fontSize: '11px',
      fontWeight: '600',
      px: 2,
      py: 1,
      borderRadius: 'full'
    }
  },

  tag: {
    base: {
      bg: colors.dark.border,
      border: '1px solid',
      borderColor: 'transparent',
      color: colors.dark.textSecondary,
      px: 3,
      py: 2,
      borderRadius: '16px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      _hover: {
        bg: colors.dark.borderHover,
        color: colors.dark.textPrimary,
        borderColor: colors.dark.borderHover
      }
    },

    active: {
      bg: colors.primary[500],
      color: 'white',
      borderColor: colors.primary[500],
      _hover: {
        bg: colors.primary[600],
        color: 'white'
      }
    },

    filter: {
      bg: colors.dark.border,
      color: colors.dark.textSecondary,
      borderColor: 'transparent',
      _hover: {
        bg: colors.dark.borderHover,
        color: colors.dark.textPrimary
      }
    }
  },

  container: {
    background: {
      bg: 'var(--color-bg-primary)',
      minH: '100vh'
    },

    sidebar: {
      w: '320px',
      bg: colors.dark.sidebarBg,
      borderRightWidth: '1px',
      borderColor: colors.dark.border,
      py: 5,
      px: 5
    },

    header: {
      bg: colors.dark.background,
      borderBottomWidth: '1px',
      borderColor: colors.dark.border,
      px: { base: 3, md: 6 },
      py: { base: 3, md: 4 }
    },

    filterBar: {
      bg: colors.dark.background,
      borderBottomWidth: '1px',
      borderColor: colors.dark.border,
      px: { base: 3, md: 6 },
      py: { base: 3, md: 4 },
      boxShadow: '0 2px 8px var(--color-card-shadow)'
    }
  }
}

// Helper functions for dynamic styles
export const getButtonStyle = (variant: 'primary' | 'secondary' | 'ghost' | 'icon') => {
  return componentStyles.button[variant]
}

export const getCardStyle = (isSelected?: boolean) => {
  // Return base or selected styles - dragging state is handled separately via opacity prop
  if (isSelected) return componentStyles.card.selected
  return componentStyles.card.base
}

export const getInputStyle = (type: 'base' | 'search' = 'base') => {
  return componentStyles.input[type]
}

export const getNavigationStyle = (isActive: boolean) => {
  return isActive ? componentStyles.navigation.active : componentStyles.navigation.item
}

export const getBadgeStyle = (variant: 'base' | 'count' | 'active' | 'error' = 'base') => {
  return componentStyles.badge[variant]
}

export const getTagStyle = (variant: 'base' | 'active' | 'filter' = 'base') => {
  return componentStyles.tag[variant]
}
