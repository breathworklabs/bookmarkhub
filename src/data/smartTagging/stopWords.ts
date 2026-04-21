/**
 * Stop words to filter out from tags
 * Common words that don't add value as tags
 */

export const STOP_WORDS = new Set([
  // Articles
  'a',
  'an',
  'the',

  // Conjunctions
  'and',
  'or',
  'but',
  'nor',
  'yet',
  'so',

  // Prepositions
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'from',
  'by',
  'about',
  'as',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'between',
  'under',
  'over',

  // Pronouns
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'me',
  'him',
  'her',
  'us',
  'them',
  'my',
  'your',
  'his',
  'its',
  'our',
  'their',
  'this',
  'that',
  'these',
  'those',

  // Verbs (common)
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'should',
  'could',
  'may',
  'might',
  'must',
  'can',

  // Other common words
  'all',
  'any',
  'both',
  'each',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'not',
  'only',
  'own',
  'same',
  'than',
  'too',
  'very',
  'just',
  'now',
  'then',
  'when',
  'where',
  'why',
  'how',
  'what',
  'which',
  'who',
  'whom',
  'whose',

  // Generic words that are also tech terms (ambiguous)
  'pack',
  'making',
  'shown',
  'total',
  'power',
  'capacity',
  'top',
  'giants',
])

/**
 * Check if a word is a stop word
 */
export function isStopWord(word: string): boolean {
  return STOP_WORDS.has(word.toLowerCase())
}
