// Style system exports
export { colors, getColorValue, getThemeColor } from './colors'
export {
  componentStyles,
  getButtonStyle,
  getCardStyle,
  getInputStyle,
  getNavigationStyle,
  getBadgeStyle,
  getTagStyle,
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
  createResponsiveStyles,
} from './responsive'

// Animation system
export {
  easings,
  durations,
  animations,
  transitions,
  animationUtils,
  performantAnimations,
} from './animations'

// Theme switching
export {
  lightThemeColors,
  darkThemeColors,
  defaultThemeConfig,
  themeUtils,
  createThemeTokens,
  themes,
} from './themes'

// Re-export all style hooks
export * from '../hooks/useStyles'
