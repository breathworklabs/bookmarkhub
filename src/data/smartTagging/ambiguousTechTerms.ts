/**
 * Ambiguous tech terms that are also common English words
 * These should only be suggested if there's additional tech context
 */

export const AMBIGUOUS_TECH_TERMS = new Set([
  'backbone', // Backbone.js vs. "backbone of the system"
  'ember', // Ember.js vs. burning ember
  'nest', // NestJS vs. bird nest
  'spring', // Spring Framework vs. season
  'go', // Golang vs. verb "go"
  'rust', // Rust language vs. corrosion
  'swift', // Swift language vs. quick
  'r', // R language vs. letter
  'c', // C language vs. letter
  'dart', // Dart language vs. throwing dart
  'atlas', // MongoDB Atlas vs. geographic atlas
  'aurora', // AWS Aurora vs. natural phenomenon
])

/**
 * Check if a term is ambiguous (common word that's also a tech term)
 */
export function isAmbiguousTechTerm(term: string): boolean {
  return AMBIGUOUS_TECH_TERMS.has(term.toLowerCase())
}

/**
 * Contextual keywords that indicate technical content
 * If these appear in the text, ambiguous terms are more likely to be tech-related
 */
export const TECH_CONTEXT_INDICATORS = new Set([
  'code',
  'coding',
  'programming',
  'developer',
  'development',
  'software',
  'framework',
  'library',
  'api',
  'app',
  'application',
  'build',
  'deploy',
  'deployment',
  'infrastructure',
  'database',
  'server',
  'client',
  'frontend',
  'backend',
  'fullstack',
  'web',
  'mobile',
  'tutorial',
  'guide',
  'documentation',
  'docs',
  'github',
  'npm',
  'package',
  'install',
  'configure',
  'setup',
])

/**
 * Check if text has technical context indicators
 */
export function hasTechContext(text: string): boolean {
  const lowerText = text.toLowerCase()
  for (const indicator of TECH_CONTEXT_INDICATORS) {
    if (lowerText.includes(indicator)) {
      return true
    }
  }
  return false
}
