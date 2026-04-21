/**
 * URL pattern matching rules
 * Comprehensive database of 50+ URL patterns
 */

import type { UrlPattern } from '@/services/smartTagging/types'

export const URL_PATTERNS: UrlPattern[] = [
  // ==================== Documentation Patterns ====================
  {
    pattern: /\/docs?\//i,
    tags: ['documentation', 'reference'],
    confidence: 0.9,
    description: 'Documentation pages',
  },
  {
    pattern: /\/api\//i,
    tags: ['api', 'reference', 'technical'],
    confidence: 0.9,
    description: 'API documentation',
  },
  {
    pattern: /\/guide\//i,
    tags: ['guide', 'tutorial', 'learning'],
    confidence: 0.85,
    description: 'Guide pages',
  },
  {
    pattern: /\/reference\//i,
    tags: ['reference', 'documentation'],
    confidence: 0.9,
    description: 'Reference documentation',
  },
  {
    pattern: /\/manual\//i,
    tags: ['manual', 'documentation', 'reference'],
    confidence: 0.85,
    description: 'Manual pages',
  },
  {
    pattern: /\/spec(ification)?\//i,
    tags: ['specification', 'reference', 'technical'],
    confidence: 0.9,
    description: 'Technical specifications',
  },

  // ==================== Content Type Patterns ====================
  {
    pattern: /\/blog\//i,
    tags: ['article', 'blog'],
    confidence: 0.9,
    description: 'Blog posts',
  },
  {
    pattern: /\/tutorial\//i,
    tags: ['tutorial', 'learning', 'guide'],
    confidence: 0.9,
    description: 'Tutorial pages',
  },
  {
    pattern: /\/course\//i,
    tags: ['course', 'learning', 'education'],
    confidence: 0.9,
    description: 'Course pages',
  },
  {
    pattern: /\/video\//i,
    tags: ['video', 'media', 'visual'],
    confidence: 0.85,
    description: 'Video content',
  },
  {
    pattern: /\/podcast\//i,
    tags: ['podcast', 'audio', 'media'],
    confidence: 0.9,
    description: 'Podcast content',
  },
  {
    pattern: /\/article\//i,
    tags: ['article', 'reading'],
    confidence: 0.9,
    description: 'Articles',
  },
  {
    pattern: /\/news\//i,
    tags: ['news', 'current-events'],
    confidence: 0.85,
    description: 'News articles',
  },

  // ==================== GitHub Specific ====================
  {
    pattern: /github\.com\/[^\/]+\/[^\/]+\/issues/i,
    tags: ['issue', 'bug', 'github', 'discussion'],
    confidence: 0.95,
    description: 'GitHub issues',
  },
  {
    pattern: /github\.com\/[^\/]+\/[^\/]+\/pull/i,
    tags: ['pull-request', 'code-review', 'github'],
    confidence: 0.95,
    description: 'GitHub pull requests',
  },
  {
    pattern: /github\.com\/[^\/]+\/[^\/]+\/releases/i,
    tags: ['release', 'changelog', 'github', 'version'],
    confidence: 0.9,
    description: 'GitHub releases',
  },
  {
    pattern: /github\.com\/[^\/]+\/[^\/]+\/wiki/i,
    tags: ['wiki', 'documentation', 'github'],
    confidence: 0.9,
    description: 'GitHub wiki',
  },
  {
    pattern: /github\.com\/[^\/]+\/[^\/]+\/discussions/i,
    tags: ['discussion', 'community', 'github'],
    confidence: 0.85,
    description: 'GitHub discussions',
  },
  {
    pattern: /github\.com\/[^\/]+\/[^\/]+\/actions/i,
    tags: ['ci-cd', 'automation', 'github', 'devops'],
    confidence: 0.9,
    description: 'GitHub Actions',
  },

  // ==================== Programming Language Patterns ====================
  {
    pattern: /\/(javascript|js)\//i,
    tags: ['javascript'],
    confidence: 0.9,
    description: 'JavaScript content',
  },
  {
    pattern: /\/(typescript|ts)\//i,
    tags: ['typescript'],
    confidence: 0.9,
    description: 'TypeScript content',
  },
  {
    pattern: /\/(python|py)\//i,
    tags: ['python'],
    confidence: 0.9,
    description: 'Python content',
  },
  {
    pattern: /\/rust\//i,
    tags: ['rust'],
    confidence: 0.9,
    description: 'Rust content',
  },
  {
    pattern: /\/go(lang)?\//i,
    tags: ['go', 'golang'],
    confidence: 0.9,
    description: 'Go content',
  },
  {
    pattern: /\/java\//i,
    tags: ['java'],
    confidence: 0.85,
    description: 'Java content',
  },
  {
    pattern: /\/ruby\//i,
    tags: ['ruby'],
    confidence: 0.9,
    description: 'Ruby content',
  },
  {
    pattern: /\/php\//i,
    tags: ['php'],
    confidence: 0.9,
    description: 'PHP content',
  },
  {
    pattern: /\/swift\//i,
    tags: ['swift', 'ios'],
    confidence: 0.9,
    description: 'Swift content',
  },
  {
    pattern: /\/kotlin\//i,
    tags: ['kotlin', 'android'],
    confidence: 0.9,
    description: 'Kotlin content',
  },

  // ==================== Framework Patterns ====================
  {
    pattern: /\/react\//i,
    tags: ['react', 'javascript', 'frontend'],
    confidence: 0.9,
    description: 'React content',
  },
  {
    pattern: /\/vue\//i,
    tags: ['vue', 'javascript', 'frontend'],
    confidence: 0.9,
    description: 'Vue content',
  },
  {
    pattern: /\/angular\//i,
    tags: ['angular', 'typescript', 'frontend'],
    confidence: 0.9,
    description: 'Angular content',
  },
  {
    pattern: /\/svelte\//i,
    tags: ['svelte', 'javascript', 'frontend'],
    confidence: 0.9,
    description: 'Svelte content',
  },
  {
    pattern: /\/next(js)?\//i,
    tags: ['nextjs', 'react', 'framework'],
    confidence: 0.9,
    description: 'Next.js content',
  },
  {
    pattern: /\/django\//i,
    tags: ['django', 'python', 'backend'],
    confidence: 0.9,
    description: 'Django content',
  },
  {
    pattern: /\/flask\//i,
    tags: ['flask', 'python', 'backend'],
    confidence: 0.9,
    description: 'Flask content',
  },

  // ==================== Technology Patterns ====================
  {
    pattern: /\/docker\//i,
    tags: ['docker', 'containerization', 'devops'],
    confidence: 0.9,
    description: 'Docker content',
  },
  {
    pattern: /\/kubernetes\//i,
    tags: ['kubernetes', 'orchestration', 'devops'],
    confidence: 0.9,
    description: 'Kubernetes content',
  },
  {
    pattern: /\/aws\//i,
    tags: ['aws', 'cloud', 'amazon'],
    confidence: 0.9,
    description: 'AWS content',
  },
  {
    pattern: /\/azure\//i,
    tags: ['azure', 'cloud', 'microsoft'],
    confidence: 0.9,
    description: 'Azure content',
  },
  {
    pattern: /\/gcp\//i,
    tags: ['gcp', 'cloud', 'google'],
    confidence: 0.9,
    description: 'Google Cloud content',
  },
  {
    pattern: /\/machine-learning|\/ml\//i,
    tags: ['machine-learning', 'ai', 'data-science'],
    confidence: 0.9,
    description: 'Machine learning content',
  },
  {
    pattern: /\/ai\//i,
    tags: ['artificial-intelligence', 'ai'],
    confidence: 0.85,
    description: 'AI content',
  },

  // ==================== Resource Type Patterns ====================
  {
    pattern: /\/examples?\//i,
    tags: ['example', 'demo', 'code'],
    confidence: 0.85,
    description: 'Example code',
  },
  {
    pattern: /\/demo\//i,
    tags: ['demo', 'example', 'showcase'],
    confidence: 0.85,
    description: 'Demo pages',
  },
  {
    pattern: /\/showcase\//i,
    tags: ['showcase', 'portfolio', 'examples'],
    confidence: 0.85,
    description: 'Showcase pages',
  },
  {
    pattern: /\/cheatsheet\//i,
    tags: ['cheatsheet', 'reference', 'quick-reference'],
    confidence: 0.9,
    description: 'Cheatsheets',
  },
  {
    pattern: /\/awesome\//i,
    tags: ['list', 'curated', 'resources'],
    confidence: 0.85,
    description: 'Awesome lists',
  },
]

/**
 * Match URL against all patterns and return matching tags
 */
export function matchUrlPatterns(
  url: string
): Array<{ tags: string[]; confidence: number }> {
  const matches: Array<{ tags: string[]; confidence: number }> = []

  for (const pattern of URL_PATTERNS) {
    const regex =
      typeof pattern.pattern === 'string'
        ? new RegExp(pattern.pattern, 'i')
        : pattern.pattern

    if (regex.test(url)) {
      matches.push({
        tags: pattern.tags,
        confidence: pattern.confidence,
      })
    }
  }

  return matches
}

/**
 * Get all unique tags from URL patterns
 */
export function getAllPatternTags(): string[] {
  const tags = new Set<string>()
  URL_PATTERNS.forEach((pattern) => {
    pattern.tags.forEach((tag) => tags.add(tag))
  })
  return Array.from(tags)
}
