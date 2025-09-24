// Style system exports
export { colors, getColorValue, getThemeColor } from './colors'
export {
  componentStyles,
  getButtonStyle,
  getCardStyle,
  getInputStyle,
  getNavigationStyle,
  getBadgeStyle,
  getTagStyle
} from './components'
export { chakraTheme } from './chakraTheme'

// Responsive design
export {
  breakpoints,
  spacing,
  fontSizes,
  containerSizes,
  gridConfig,
  responsiveVariants,
  getResponsiveValue,
  createResponsiveStyles
} from './responsive'

// Animation system
export {
  easings,
  durations,
  animations,
  transitions,
  animationUtils,
  performantAnimations
} from './animations'

// Theme switching
export {
  lightThemeColors,
  darkThemeColors,
  defaultThemeConfig,
  themeUtils,
  createThemeTokens,
  themes
} from './themes'

// Legacy theme (deprecated - use new style system)
export { theme, getFilterTabStyle, getIconButtonStyle } from './theme'

// Re-export all style hooks
export * from '../hooks/useStyles'
export {
  useTheme,
  useThemeColors,
  useThemeTokens,
  useIsDarkTheme,
  useThemeColor,
  useThemeStyles
} from '../hooks/useTheme'
