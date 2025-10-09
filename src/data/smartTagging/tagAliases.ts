/**
 * Tag aliases mapping
 * Maps common abbreviations and variations to canonical forms
 */

export const TAG_ALIASES: Record<string, string> = {
  // Programming Languages
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  golang: 'go',
  cpp: 'c++',
  csharp: 'c#',
  'c-sharp': 'c#',
  objc: 'objective-c',
  'objective-c': 'objectivec',

  // Frameworks & Libraries - JavaScript
  'react.js': 'react',
  'reactjs': 'react',
  'vue.js': 'vue',
  'vuejs': 'vue',
  'angular.js': 'angular',
  'angularjs': 'angular',
  'next.js': 'nextjs',
  'node.js': 'nodejs',
  'express.js': 'express',

  // Frameworks & Libraries - Python
  'django': 'python-django',
  'flask': 'python-flask',

  // Frameworks & Libraries - Other
  'asp.net': 'aspnet',
  '.net': 'dotnet',
  'net': 'dotnet',

  // Databases
  'db': 'database',
  'postgres': 'postgresql',
  'mongo': 'mongodb',
  'mysql': 'mysql-database',
  'sql': 'database',

  // Tools
  'docker': 'containerization',
  'k8s': 'kubernetes',
  'kube': 'kubernetes',
  'aws': 'amazon-web-services',
  'gcp': 'google-cloud',
  'azure': 'microsoft-azure',

  // Concepts
  'ai': 'artificial-intelligence',
  'ml': 'machine-learning',
  'dl': 'deep-learning',
  'nlp': 'natural-language-processing',
  'api': 'application-programming-interface',
  'ui': 'user-interface',
  'ux': 'user-experience',
  'css': 'cascading-style-sheets',
  'html': 'hypertext-markup-language',
  'http': 'hypertext-transfer-protocol',
  'rest': 'restful-api',
  'graphql': 'graph-query-language',
  'ci': 'continuous-integration',
  'cd': 'continuous-deployment',
  'cicd': 'ci-cd',
  'devops': 'development-operations',
  'seo': 'search-engine-optimization',
  'qa': 'quality-assurance',

  // Content Types
  'tut': 'tutorial',
  'doc': 'documentation',
  'docs': 'documentation',
  'vid': 'video',
  'blog': 'article',
  'post': 'article',

  // Social
  'tweet': 'twitter',
  'gh': 'github',

  // Common variations
  'webapp': 'web-app',
  'website': 'web',
  'opensource': 'open-source',
  'fullstack': 'full-stack',
  'frontend': 'front-end',
  'backend': 'back-end',
  'webdev': 'web-development',
  'webdesign': 'web-design',
  'mobiledev': 'mobile-development',
  'gamedev': 'game-development',
}

/**
 * Apply alias mapping to a tag
 */
export function applyTagAlias(tag: string): string {
  const lowerTag = tag.toLowerCase()
  return TAG_ALIASES[lowerTag] || tag
}

/**
 * Check if a tag has an alias
 */
export function hasAlias(tag: string): boolean {
  return tag.toLowerCase() in TAG_ALIASES
}
