// Theme colors and common styles
export const theme = {
  colors: {
    background: '#0f1419',
    sidebarBg: '#16181c',
    cardBg: '#1a1d23',
    border: '#2a2d35',
    borderHover: '#3a3d45',
    primary: '#1d4ed8',
    primaryHover: '#1e40af',
    textPrimary: '#e1e5e9',
    textSecondary: '#71767b',
    textMuted: '#9ca3af',
  },

  styles: {
    // Search Input
    searchContainer: {
      bg: '#1a1d23',
      border: '1px solid #2a2d35',
      borderRadius: '20px',
      px: 3,
      py: 2,
      h: '36px',
      _focusWithin: {
        borderColor: '#1d4ed8',
        boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.1)'
      }
    },

    searchInput: {
      bg: 'transparent',
      border: 'none',
      outline: 'none',
      _focus: { outline: 'none', boxShadow: 'none' },
      color: '#e1e5e9',
      fontSize: '14px',
      fontWeight: '400',
      _placeholder: { color: '#71767b' },
      flex: 1
    },

    // Buttons
    primaryButton: {
      size: 'sm' as const,
      px: 4,
      py: 2,
      borderRadius: '12px',
      bg: '#1d4ed8',
      color: 'white',
      fontSize: '14px',
      fontWeight: '600',
      _hover: { bg: '#1e40af' },
      gap: 2
    },

    secondaryButton: {
      variant: 'outline' as const,
      size: 'sm' as const,
      px: 4,
      py: 2,
      borderRadius: '12px',
      bg: 'transparent',
      border: '1px solid #2a2d35',
      color: '#71767b',
      fontSize: '14px',
      fontWeight: '500',
      _hover: {
        bg: '#1a1d23',
        color: '#e1e5e9',
        borderColor: '#3a3d45'
      },
      gap: 2
    },

    // Filter Tab
    filterTab: {
      variant: 'ghost' as const,
      size: 'sm' as const,
      px: 4,
      py: 2,
      borderRadius: '20px',
      fontSize: '14px'
    },

    // Tag
    tag: {
      bg: '#1a1d23',
      border: '1px solid #2a2d35',
      color: '#9ca3af',
      px: 3,
      py: 2,
      borderRadius: '16px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      _hover: {
        bg: '#252932',
        color: '#e1e5e9',
        borderColor: '#3a3d45'
      },
      gap: 2,
      alignItems: 'center'
    },

    // Card
    card: {
      bg: '#1a1d23',
      borderWidth: '1px',
      borderColor: '#2a2d35',
      borderRadius: '16px',
      p: 4,
      _hover: {
        borderColor: '#4a9eff',
        transform: 'translateY(-1px)',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }
    },

    // Container
    container: {
      background: { bg: '#0f1419', minH: '100vh' },
      sidebar: { w: '280px', bg: '#16181c', borderRightWidth: '1px', borderColor: 'gray.700', p: 5 },
      header: { bg: '#0f1419', borderBottomWidth: '1px', borderColor: '#2a2d35', px: 6, py: 4 },
      filterBar: { bg: '#0f1419', borderBottomWidth: '1px', borderColor: 'gray.700', px: 6, py: 4 }
    }
  }
};

// Helper functions for dynamic styles
export const getFilterTabStyle = (isActive: boolean) => ({
  ...theme.styles.filterTab,
  bg: isActive ? '#1d4ed8' : 'transparent',
  color: isActive ? 'white' : '#71767b',
  fontWeight: isActive ? '600' : '400',
  _hover: {
    bg: isActive ? '#1e40af' : '#2a2d35',
    color: isActive ? 'white' : '#e1e5e9'
  }
});

export const getIconButtonStyle = (isActive: boolean, activeColor = '#ffd700') => ({
  size: 'sm' as const,
  variant: 'ghost' as const,
  color: isActive ? activeColor : '#71767b',
  _hover: {
    bg: '#2a2d35',
    color: isActive ? activeColor : '#e1e5e9'
  }
});