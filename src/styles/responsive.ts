// Responsive design tokens for consistent breakpoints and spacing
export const breakpoints = {
  base: '0px',
  sm: '480px',
  md: '768px',
  lg: '992px',
  xl: '1280px',
  '2xl': '1536px'
} as const

// Responsive spacing scale
export const spacing = {
  xs: { base: '4px', sm: '6px', md: '8px' },
  sm: { base: '8px', sm: '12px', md: '16px' },
  md: { base: '12px', sm: '16px', md: '20px' },
  lg: { base: '16px', sm: '20px', md: '24px' },
  xl: { base: '20px', sm: '24px', md: '32px' },
  '2xl': { base: '24px', sm: '32px', md: '40px' },
  '3xl': { base: '32px', sm: '40px', md: '48px' }
} as const

// Responsive font sizes
export const fontSizes = {
  xs: { base: '10px', sm: '11px', md: '12px' },
  sm: { base: '12px', sm: '13px', md: '14px' },
  md: { base: '14px', sm: '15px', md: '16px' },
  lg: { base: '16px', sm: '17px', md: '18px' },
  xl: { base: '18px', sm: '20px', md: '22px' },
  '2xl': { base: '20px', sm: '22px', md: '24px' },
  '3xl': { base: '24px', sm: '28px', md: '32px' }
} as const

// Responsive container widths
export const containerSizes = {
  sidebar: { base: '0', sm: '0', md: '320px' }, // Hidden on mobile, visible on desktop
  content: { base: '100%', sm: '100%', md: 'calc(100% - 320px)' },
  card: { base: '100%', sm: '100%', md: '100%' },
  modal: { base: '95vw', sm: '90vw', md: '600px' }
} as const

// Mobile-specific configurations
export const mobileConfig = {
  drawerWidth: '280px',
  headerHeight: '64px',
  bottomNavHeight: '56px',
  touchTargetSize: '44px', // Minimum touch target size for accessibility
  swipeThreshold: 50, // Pixels needed to trigger a swipe action
} as const

// Responsive grid configurations
export const gridConfig = {
  bookmarks: {
    base: { columns: 1, gap: '16px' },
    sm: { columns: 1, gap: '20px' },
    md: { columns: 2, gap: '24px' },
    lg: { columns: 3, gap: '24px' },
    xl: { columns: 4, gap: '24px' }
  },
  filters: {
    base: { columns: 1, gap: '12px' },
    sm: { columns: 2, gap: '16px' },
    md: { columns: 3, gap: '20px' }
  }
} as const

// Responsive component variants
export const responsiveVariants = {
  button: {
    base: { size: 'sm', px: '12px', py: '8px' },
    sm: { size: 'sm', px: '16px', py: '10px' },
    md: { size: 'md', px: '20px', py: '12px' }
  },
  card: {
    base: { p: '12px', borderRadius: '12px' },
    sm: { p: '16px', borderRadius: '14px' },
    md: { p: '20px', borderRadius: '16px' }
  },
  input: {
    base: { size: 'sm', px: '12px', py: '8px' },
    sm: { size: 'md', px: '16px', py: '10px' },
    md: { size: 'md', px: '20px', py: '12px' }
  }
} as const

// Helper function to get responsive value
export const getResponsiveValue = <T>(
  values: T | { base: T; sm?: T; md?: T; lg?: T; xl?: T },
  breakpoint: keyof typeof breakpoints = 'base'
): T => {
  if (typeof values === 'object' && values !== null && 'base' in values) {
    return (values as any)[breakpoint] || (values as any).base
  }
  return values as T
}

// Helper function to create responsive styles
export const createResponsiveStyles = <T>(
  baseStyles: T,
  responsiveOverrides?: Partial<Record<keyof typeof breakpoints, Partial<T>>>
): T => {
  if (!responsiveOverrides) return baseStyles

  // This would be used with Chakra UI's responsive syntax
  // For now, return base styles - actual responsive implementation
  // would be handled by Chakra UI's responsive props
  return baseStyles
}
