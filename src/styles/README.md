# Style System Documentation

This document provides comprehensive guidelines for using the X Bookmark Manager's design system.

## Table of Contents

1. [Overview](#overview)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Components](#components)
6. [Animations](#animations)
7. [Responsive Design](#responsive-design)
8. [Theme Switching](#theme-switching)
9. [Best Practices](#best-practices)
10. [Migration Guide](#migration-guide)

## Overview

The X Bookmark Manager uses a comprehensive design system built on top of Chakra UI v3, providing:

- **Consistent Design Language**: Unified colors, typography, and spacing
- **Theme Support**: Dark/light mode with system preference detection
- **Responsive Design**: Mobile-first approach with consistent breakpoints
- **Performance**: Optimized animations and transitions
- **Type Safety**: Full TypeScript support for all design tokens

## Color System

### Primary Colors

```typescript
import { colors } from '../styles/colors'

// Primary brand colors
colors.primary[500]  // #1d4ed8 - Main brand color
colors.primary[600]  // #1e40af - Hover state
colors.primary[700]  // #1d4ed8 - Active state
```

### Semantic Colors

```typescript
// Status colors
colors.success[500]  // #22c55e - Success states
colors.warning[500]  // #f59e0b - Warning states
colors.error[500]    // #dc2626 - Error states
colors.info[500]     // #3b82f6 - Info states
```

### Theme-Specific Colors

```typescript
// Dark theme
colors.dark.background    // #0f1419 - Main background
colors.dark.sidebarBg     // #16181c - Sidebar background
colors.dark.cardBg        // #1a1d23 - Card background
colors.dark.border        // #2a2d35 - Default borders
colors.dark.textPrimary   // #e1e5e9 - Primary text
colors.dark.textSecondary // #71767b - Secondary text
```

### Usage Examples

```typescript
// Using colors in components
<Box bg={colors.dark.background} color={colors.dark.textPrimary}>
  Content
</Box>

// Using semantic colors
<Alert status="error" bg={colors.error[500]}>
  Error message
</Alert>
```

## Typography

### Font Sizes

```typescript
import { fontSizes } from '../styles/responsive'

// Responsive font sizes
fontSizes.xs   // 10px/11px/12px (base/sm/md)
fontSizes.sm   // 12px/13px/14px
fontSizes.md   // 14px/15px/16px
fontSizes.lg   // 16px/17px/18px
fontSizes.xl   // 18px/20px/22px
```

### Font Weights

```typescript
// Standard font weights
fontWeight: '400'  // Normal
fontWeight: '500'  // Medium
fontWeight: '600'  // Semibold
fontWeight: '700'  // Bold
```

## Spacing

### Spacing Scale

```typescript
import { spacing } from '../styles/responsive'

// Responsive spacing
spacing.xs   // 4px/6px/8px (base/sm/md)
spacing.sm   // 8px/12px/16px
spacing.md   // 12px/16px/20px
spacing.lg   // 16px/20px/24px
spacing.xl   // 20px/24px/32px
```

### Usage Examples

```typescript
// Padding and margins
<Box p={spacing.md} m={spacing.lg}>
  Content
</Box>

// Gap in flex/grid layouts
<HStack gap={spacing.sm}>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</HStack>
```

## Components

### Style Hooks

Use the provided style hooks for consistent component styling:

```typescript
import {
  useButtonStyles,
  useCardStyles,
  useInputStyles,
  useNavigationStyles,
  useIconButtonStyles
} from '../hooks/useStyles'

// Button styles
const buttonStyles = useButtonStyles('primary')
<Button {...buttonStyles}>Click me</Button>

// Card styles
const cardStyles = useCardStyles(isSelected, isDragging)
<Card {...cardStyles}>Card content</Card>

// Input styles
const inputStyles = useInputStyles('search')
<Input {...inputStyles} placeholder="Search..." />
```

### Component Variants

```typescript
// Button variants
useButtonStyles('primary')   // Primary action buttons
useButtonStyles('secondary') // Secondary actions
useButtonStyles('ghost')     // Subtle actions
useButtonStyles('icon')      // Icon-only buttons

// Card states
useCardStyles(false, false)  // Default card
useCardStyles(true, false)   // Selected card
useCardStyles(false, true)   // Dragging card
```

## Animations

### Animation Presets

```typescript
import { animations, transitions } from '../styles/animations'

// Fade animations
animations.fadeIn    // Fade in from transparent
animations.fadeOut   // Fade out to transparent

// Slide animations
animations.slideInUp    // Slide in from bottom
animations.slideInDown  // Slide in from top
animations.slideInLeft  // Slide in from left
animations.slideInRight // Slide in from right

// Scale animations
animations.scaleIn   // Scale in from smaller
animations.scaleOut  // Scale out to smaller
```

### Transition Presets

```typescript
// Component transitions
transitions.button  // Button hover/active states
transitions.card    // Card hover effects
transitions.input   // Input focus states
transitions.modal   // Modal enter/exit
```

### Usage Examples

```typescript
// Applying transitions
<Button
  transition={transitions.button.transition}
  _hover={transitions.button._hover}
>
  Hover me
</Button>

// Custom animations
<Box
  animation={`${animations.fadeIn.duration} ${animations.fadeIn.easing}`}
>
  Animated content
</Box>
```

## Responsive Design

### Breakpoints

```typescript
import { breakpoints } from '../styles/responsive'

breakpoints.base  // 0px
breakpoints.sm    // 480px
breakpoints.md    // 768px
breakpoints.lg    // 992px
breakpoints.xl    // 1280px
breakpoints['2xl'] // 1536px
```

### Responsive Values

```typescript
// Chakra UI responsive syntax
<Box
  w={{ base: '100%', md: '50%', lg: '33%' }}
  p={{ base: 4, md: 6, lg: 8 }}
  fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
>
  Responsive content
</Box>
```

### Container Sizes

```typescript
import { containerSizes } from '../styles/responsive'

containerSizes.sidebar  // 240px/260px/280px
containerSizes.content  // 100%/100%/calc(100% - 280px)
containerSizes.modal    // 90vw/80vw/600px
```

## Theme Switching

### Theme Hook

```typescript
import { useTheme } from '../hooks/useTheme'

const MyComponent = () => {
  const { theme, setTheme, toggleTheme, tokens } = useTheme()

  return (
    <Box>
      <Text>Current theme: {theme.mode}</Text>
      <Button onClick={toggleTheme}>
        Switch to {theme.isDark ? 'light' : 'dark'} mode
      </Button>
    </Box>
  )
}
```

### Theme-Aware Colors

```typescript
import { useThemeColor, useThemeStyles } from '../hooks/useTheme'

const MyComponent = () => {
  // Get theme-aware color
  const backgroundColor = useThemeColor('#ffffff', '#0f1419')

  // Get theme-aware styles
  const styles = useThemeStyles(
    { bg: '#ffffff', color: '#000000' },
    { bg: '#0f1419', color: '#ffffff' }
  )

  return <Box {...styles}>Content</Box>
}
```

### Theme Tokens

```typescript
import { useThemeTokens } from '../hooks/useTheme'

const MyComponent = () => {
  const tokens = useThemeTokens()

  return (
    <Box
      bg={tokens.bg.primary}
      color={tokens.text.primary}
      borderColor={tokens.border.primary}
    >
      Themed content
    </Box>
  )
}
```

## Best Practices

### 1. Use Style Hooks

✅ **Good**: Use provided style hooks
```typescript
const buttonStyles = useButtonStyles('primary')
<Button {...buttonStyles}>Click me</Button>
```

❌ **Avoid**: Hardcoded styles
```typescript
<Button bg="#1d4ed8" color="white" _hover={{ bg: "#1e40af" }}>
  Click me
</Button>
```

### 2. Leverage Theme System

✅ **Good**: Use theme tokens
```typescript
const tokens = useThemeTokens()
<Box bg={tokens.bg.primary} color={tokens.text.primary}>
  Content
</Box>
```

❌ **Avoid**: Hardcoded theme colors
```typescript
<Box bg="#0f1419" color="#e1e5e9">
  Content
</Box>
```

### 3. Use Responsive Design

✅ **Good**: Responsive values
```typescript
<Box w={{ base: '100%', md: '50%' }} p={{ base: 4, md: 6 }}>
  Content
</Box>
```

❌ **Avoid**: Fixed values
```typescript
<Box w="50%" p={6}>
  Content
</Box>
```

### 4. Apply Consistent Animations

✅ **Good**: Use animation presets
```typescript
<Box transition={transitions.card.transition} _hover={transitions.card._hover}>
  Card
</Box>
```

❌ **Avoid**: Custom animation values
```typescript
<Box transition="all 0.2s ease" _hover={{ transform: "translateY(-2px)" }}>
  Card
</Box>
```

## Migration Guide

### From Hardcoded Styles

1. **Identify hardcoded values**:
   ```typescript
   // Before
   <Button bg="#1d4ed8" color="white">
   ```

2. **Replace with style hooks**:
   ```typescript
   // After
   const buttonStyles = useButtonStyles('primary')
   <Button {...buttonStyles}>
   ```

3. **Update color references**:
   ```typescript
   // Before
   color="#71767b"

   // After
   color={colors.dark.textSecondary}
   // or
   color={tokens.text.secondary}
   ```

### From Legacy Theme

1. **Replace theme imports**:
   ```typescript
   // Before
   import { theme } from '../styles/theme'

   // After
   import { useButtonStyles } from '../hooks/useStyles'
   ```

2. **Update style references**:
   ```typescript
   // Before
   {...theme.styles.primaryButton}

   // After
   {...useButtonStyles('primary')}
   ```

## File Structure

```
src/styles/
├── colors.ts          # Color definitions
├── components.ts      # Component style variants
├── chakraTheme.ts     # Chakra UI theme configuration
├── responsive.ts      # Responsive design tokens
├── animations.ts      # Animation and transition system
├── themes.ts          # Theme switching system
├── theme.ts           # Legacy theme (deprecated)
├── index.ts           # Style system exports
└── README.md          # This documentation

src/hooks/
├── useStyles.ts       # Style hooks
└── useTheme.ts        # Theme management hook
```

## Support

For questions or issues with the style system:

1. Check this documentation
2. Review existing component implementations
3. Follow the established patterns
4. Ensure TypeScript compliance

Remember: Consistency is key to maintaining a cohesive user experience across the application.
