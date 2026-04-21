// Animation and transition system for consistent motion design

// Easing functions
export const easings = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  // Custom cubic-bezier curves
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  // Material Design inspired
  material: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
  materialAccelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  materialDecelerate: 'cubic-bezier(0, 0, 0.2, 1)',
} as const

// Duration scale
export const durations = {
  instant: '0ms',
  fast: '100ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
  slowest: '700ms',
} as const

// Common animation presets
export const animations = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: durations.normal,
    easing: easings.smooth,
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: durations.fast,
    easing: easings.smooth,
  },

  // Slide animations
  slideInUp: {
    from: { transform: 'translateY(20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: durations.normal,
    easing: easings.smooth,
  },
  slideInDown: {
    from: { transform: 'translateY(-20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: durations.normal,
    easing: easings.smooth,
  },
  slideInLeft: {
    from: { transform: 'translateX(-20px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
    duration: durations.normal,
    easing: easings.smooth,
  },
  slideInRight: {
    from: { transform: 'translateX(20px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
    duration: durations.normal,
    easing: easings.smooth,
  },

  // Scale animations
  scaleIn: {
    from: { transform: 'scale(0.9)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: durations.normal,
    easing: easings.bounce,
  },
  scaleOut: {
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.9)', opacity: 0 },
    duration: durations.fast,
    easing: easings.smooth,
  },

  // Rotation animations
  rotateIn: {
    from: { transform: 'rotate(-180deg)', opacity: 0 },
    to: { transform: 'rotate(0deg)', opacity: 1 },
    duration: durations.slow,
    easing: easings.elastic,
  },

  // Pulse animation for loading states
  pulse: {
    from: { opacity: 1 },
    to: { opacity: 0.5 },
    duration: durations.normal,
    easing: easings.easeInOut,
    iterationCount: 'infinite',
    direction: 'alternate',
  },

  // Shake animation for errors
  shake: {
    from: { transform: 'translateX(0)' },
    '10%': { transform: 'translateX(-5px)' },
    '20%': { transform: 'translateX(5px)' },
    '30%': { transform: 'translateX(-5px)' },
    '40%': { transform: 'translateX(5px)' },
    '50%': { transform: 'translateX(-5px)' },
    '60%': { transform: 'translateX(5px)' },
    '70%': { transform: 'translateX(-5px)' },
    '80%': { transform: 'translateX(5px)' },
    '90%': { transform: 'translateX(-5px)' },
    to: { transform: 'translateX(0)' },
    duration: durations.slower,
    easing: easings.easeInOut,
  },
} as const

// Transition presets for common interactions
export const transitions = {
  // Button interactions
  button: {
    transition: `all ${durations.fast} ${easings.smooth}`,
    _hover: {
      transform: 'translateY(-1px)',
      transition: `all ${durations.fast} ${easings.smooth}`,
    },
    _active: {
      transform: 'translateY(0)',
      transition: `all ${durations.instant} ${easings.smooth}`,
    },
  },

  // Card interactions
  card: {
    transition: `all ${durations.normal} ${easings.smooth}`,
    _hover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      transition: `all ${durations.normal} ${easings.smooth}`,
    },
  },

  // Input focus
  input: {
    transition: `border-color ${durations.fast} ${easings.smooth}, box-shadow ${durations.fast} ${easings.smooth}`,
    _focus: {
      transition: `border-color ${durations.fast} ${easings.smooth}, box-shadow ${durations.fast} ${easings.smooth}`,
    },
  },

  // Modal animations
  modal: {
    overlay: {
      transition: `opacity ${durations.normal} ${easings.smooth}`,
      _enter: {
        opacity: 0,
      },
      _exit: {
        opacity: 0,
      },
    },
    content: {
      transition: `opacity ${durations.normal} ${easings.smooth}, transform ${durations.normal} ${easings.smooth}`,
      _enter: {
        opacity: 0,
        transform: 'scale(0.95) translateY(-10px)',
      },
      _exit: {
        opacity: 0,
        transform: 'scale(0.95) translateY(-10px)',
      },
    },
  },

  // List item animations
  listItem: {
    transition: `background-color ${durations.fast} ${easings.smooth}, transform ${durations.fast} ${easings.smooth}`,
    _hover: {
      transition: `background-color ${durations.fast} ${easings.smooth}, transform ${durations.fast} ${easings.smooth}`,
    },
  },

  // Page transitions
  page: {
    transition: `opacity ${durations.normal} ${easings.smooth}, transform ${durations.normal} ${easings.smooth}`,
    _enter: {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    _exit: {
      opacity: 0,
      transform: 'translateY(-20px)',
    },
  },
} as const

// Animation utilities
export const animationUtils = {
  // Create a staggered animation delay
  getStaggerDelay: (index: number, baseDelay: number = 50) =>
    `${index * baseDelay}ms`,

  // Create a spring animation
  createSpring: (_tension: number = 300, friction: number = 30) =>
    `cubic-bezier(0.175, 0.885, 0.32, ${1 + friction / 100})`,

  // Create a bounce animation
  createBounce: (intensity: number = 0.3) =>
    `cubic-bezier(0.68, ${-0.55 - intensity}, 0.265, ${1.55 + intensity})`,

  // Create an elastic animation
  createElastic: (intensity: number = 0.1) =>
    `cubic-bezier(0.175, 0.885, 0.32, ${1.275 + intensity})`,
} as const

// Performance-optimized animations (using transform and opacity only)
export const performantAnimations = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: durations.normal,
    easing: easings.smooth,
  },
  slideUp: {
    from: { transform: 'translateY(20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: durations.normal,
    easing: easings.smooth,
  },
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: durations.normal,
    easing: easings.smooth,
  },
} as const
