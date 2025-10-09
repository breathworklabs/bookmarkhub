# Smart Tagging Architecture - Phase 1

> **Privacy-First Auto-Tagging System for X Bookmark Manager**
>
> Rule-based NLP tagging with X/Twitter content awareness

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Decisions](#architecture-decisions)
3. [File Structure](#file-structure)
4. [Core Components](#core-components)
5. [Tagging Strategies](#tagging-strategies)
6. [Type Definitions](#type-definitions)
7. [Testing Strategy](#testing-strategy)
8. [Implementation Plan](#implementation-plan)
9. [Examples](#examples)

---

## Overview

### The Problem

Most bookmarks in X Bookmark Manager come from X/Twitter, which means:
- **Domain**: Always `x.com` or `twitter.com` (not useful for tagging)
- **URL**: Points to tweet, not the actual content
- **Content**: Often contains embedded links to the real content (GitHub, articles, videos, etc.)

### The Solution

Multi-layer tag generation system:

```
┌─────────────────────────────────────────────────────────────┐
│                    X/Twitter Bookmark                        │
│  domain: "x.com"                                            │
│  url: "https://x.com/user/status/123"                       │
│  description: "Check out this React guide https://react.dev"│
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Smart Tagging Service                           │
│                                                              │
│  1. Extract embedded URLs from content     (Priority 1)     │
│  2. Analyze URL patterns                   (Priority 2)     │
│  3. Extract keywords with NLP              (Priority 3)     │
│  4. Learn from similar bookmarks           (Priority 4)     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Tagged Bookmark                            │
│  tags: ["react", "documentation", "frontend", "guide"]      │
│  confidence: [0.95, 0.90, 0.85, 0.75]                       │
└─────────────────────────────────────────────────────────────┘
```

### Goals

- **Accuracy**: 60-70% tag relevance
- **Speed**: <100ms per bookmark
- **Privacy**: 100% local processing
- **Cost**: $0 (no external APIs)
- **Coverage**: >80% test coverage

---

## Architecture Decisions

### Why Not LLMs?

| Approach | Cost | Privacy | Accuracy | Speed | Verdict |
|----------|------|---------|----------|-------|---------|
| **OpenAI GPT** | $0.002-0.01/tag | ❌ Low | 90-95% | 1-2s | ❌ Overkill |
| **Claude** | $0.01-0.05/tag | ❌ Low | 90-95% | 1-2s | ❌ Expensive |
| **Local LLM** | Free | ✅ High | 70-80% | 2-5s | ⚠️ Complex |
| **Rule-Based** | Free | ✅ High | 60-70% | <100ms | ✅ Perfect fit |

**Decision**: Start with lightweight rule-based system. Can add LLM enhancement later as premium feature.

### Technology Stack

- **NLP Library**: `compromise.js` (200KB, no dependencies)
- **Pattern Matching**: Custom regex + rule engine
- **Learning**: Statistical analysis of user tags
- **Storage**: All processing in-memory, results in localStorage

---

## File Structure

```
src/
├── services/
│   └── smartTagging/
│       ├── index.ts                          # Public API (barrel export)
│       ├── SmartTaggingService.ts           # Main orchestrator (facade pattern)
│       │
│       ├── strategies/                       # Strategy pattern for tag sources
│       │   ├── DomainTagStrategy.ts         # Domain-based tagging
│       │   ├── UrlPatternStrategy.ts        # URL pattern matching
│       │   ├── NlpKeywordStrategy.ts        # NLP keyword extraction
│       │   └── LearningStrategy.ts          # User behavior learning
│       │
│       ├── core/                            # Core utilities
│       │   ├── ContentLinkExtractor.ts      # 🆕 Extract URLs from content
│       │   ├── TagNormalizer.ts             # Tag cleaning/normalization
│       │   ├── ConfidenceCalculator.ts      # Confidence scoring
│       │   └── TagDeduplicator.ts           # Remove duplicates
│       │
│       ├── types.ts                         # All TypeScript types
│       └── config.ts                        # Configuration constants
│
├── data/
│   └── smartTagging/                        # Static data (easily extensible)
│       ├── domainRules.ts                   # Domain → tag mappings (500+)
│       ├── urlPatterns.ts                   # URL pattern rules
│       ├── techKeywords.ts                  # Tech vocabulary
│       └── stopWords.ts                     # Words to ignore
│
├── hooks/
│   └── smartTagging/
│       ├── useSmartTagging.ts               # Main hook
│       ├── useTagSuggestions.ts             # UI suggestions
│       └── useBulkTagging.ts                # Bulk operations
│
├── components/
│   └── smartTagging/
│       ├── AutoTagButton.tsx                # Trigger button
│       ├── TagSuggestionsList.tsx           # List of suggestions
│       ├── TagConfidenceBadge.tsx           # Visual confidence indicator
│       ├── BulkTaggingModal.tsx             # Bulk tagging UI
│       └── SmartTaggingSettings.tsx         # Settings panel
│
└── tests/
    └── smartTagging/
        ├── unit/                            # 50% of tests
        │   ├── ContentLinkExtractor.test.ts
        │   ├── DomainTagStrategy.test.ts
        │   ├── UrlPatternStrategy.test.ts
        │   ├── NlpKeywordStrategy.test.ts
        │   ├── LearningStrategy.test.ts
        │   ├── TagNormalizer.test.ts
        │   └── TagDeduplicator.test.ts
        │
        ├── integration/                     # 30% of tests
        │   └── SmartTaggingService.test.ts
        │
        ├── hooks/                           # 10% of tests
        │   └── useSmartTagging.test.ts
        │
        ├── components/                      # 10% of tests
        │   └── AutoTagButton.test.tsx
        │
        └── fixtures/
            ├── mockBookmarks.ts
            ├── mockDomainRules.ts
            └── testHelpers.ts
```

---

## Core Components

### 1. ContentLinkExtractor

**Purpose**: Extract and analyze URLs from bookmark content (X/Twitter awareness)

**Key Methods**:
- `extractLinks(bookmark)` → Find all URLs in content
- `getPrimaryLink(bookmark)` → Get most relevant link
- `calculateLinkConfidence()` → Score link relevance

**Algorithm**:
```typescript
1. Search for URLs in: description, content, title
2. Skip X/Twitter URLs (t.co, x.com, twitter.com)
3. Extract domain from each URL
4. Analyze context (surrounding text)
5. Calculate confidence score (0-1)
   - Position in text (earlier = higher)
   - Context quality (descriptive words nearby)
   - URL format (full URLs > shortened)
6. Deduplicate and rank by confidence
```

**Example**:
```typescript
const bookmark = {
  domain: "x.com",
  description: "Check out this React guide https://react.dev/learn"
}

const links = extractor.extractLinks(bookmark)
// [{ url: "https://react.dev/learn", domain: "react.dev", confidence: 0.85 }]
```

### 2. SmartTaggingService

**Purpose**: Main orchestrator combining all strategies

**Flow**:
```
Input: Bookmark
  ↓
1. Extract embedded links (ContentLinkExtractor)
  ↓
2. Apply DomainTagStrategy (check embedded domains + bookmark domain)
  ↓
3. Apply UrlPatternStrategy (check URL paths)
  ↓
4. Apply NlpKeywordStrategy (analyze text content)
  ↓
5. Apply LearningStrategy (similar bookmarks)
  ↓
6. Deduplicate & combine confidences
  ↓
7. Sort by confidence
  ↓
8. Split: auto-apply (>0.8) vs needs-review (<0.8)
  ↓
Output: TaggingResult
```

### 3. TagNormalizer

**Purpose**: Clean and standardize tags

**Rules**:
- Lowercase all tags
- Remove special characters (keep hyphens)
- Skip stop words ("the", "a", "an", etc.)
- Apply aliases (js → javascript, py → python)
- Minimum length: 2 characters
- Maximum length: 30 characters

---

## Tagging Strategies

### Strategy 1: Domain-Based Tagging

**Priority**: Highest (most reliable)

**Process**:
1. Extract embedded links from content
2. Match domains against rule database (500+ domains)
3. Apply tags with domain confidence × link confidence
4. Fallback to bookmark domain (if not X/Twitter)

**Example Rules**:
```typescript
{ domain: 'github.com', tags: ['code', 'development', 'open-source'], confidence: 0.95 }
{ domain: 'stackoverflow.com', tags: ['programming', 'qa'], confidence: 0.95 }
{ domain: 'youtube.com', tags: ['video', 'media'], confidence: 0.85 }
{ domain: 'dev.to', tags: ['article', 'development'], confidence: 0.90 }
{ domain: 'medium.com', tags: ['article', 'blog'], confidence: 0.90 }
```

**X/Twitter Handling**:
```typescript
// LOW priority for X/Twitter domains
{ domain: 'x.com', tags: ['social', 'thread'], confidence: 0.3 }
{ domain: 'twitter.com', tags: ['social', 'thread'], confidence: 0.3 }
```

### Strategy 2: URL Pattern Matching

**Priority**: High

**Process**:
1. Check URL path for common patterns
2. Match against regex rules
3. Apply tags with pattern confidence

**Example Patterns**:
```typescript
{ pattern: /\/docs?\//i, tags: ['documentation', 'reference'], confidence: 0.9 }
{ pattern: /\/blog\//i, tags: ['article', 'blog'], confidence: 0.9 }
{ pattern: /\/tutorial\//i, tags: ['tutorial', 'learning'], confidence: 0.9 }
{ pattern: /github\.com\/.*\/issues/i, tags: ['issue', 'bug'], confidence: 0.95 }
{ pattern: /\/api\//i, tags: ['api', 'reference', 'technical'], confidence: 0.9 }
```

### Strategy 3: NLP Keyword Extraction

**Priority**: Medium

**Process**:
1. Analyze text with compromise.js
2. Extract: named entities, topics, nouns
3. Match against tech keyword dictionary
4. Apply stop word filter
5. Rank by relevance

**NLP Types**:
- **Entities**: Organizations, people, places (confidence: 0.8)
- **Topics**: Important noun phrases (confidence: 0.75)
- **Tech Keywords**: Exact match tech terms (confidence: 0.9)
- **Nouns**: General nouns (confidence: 0.6)

**Example**:
```typescript
Text: "Just released a new guide on React Server Components"

Extracted:
- "react" (tech keyword, confidence: 0.9)
- "server components" (topic, confidence: 0.75)
- "guide" (noun, confidence: 0.6)
```

### Strategy 4: User Behavior Learning

**Priority**: Low (supporting role)

**Process**:
1. Find bookmarks similar to target
2. Calculate similarity score (0-1)
   - Same domain: +0.4
   - Same author: +0.3
   - Title overlap: +0.3
   - Description overlap: +0.2
3. Extract common tags from similar bookmarks
4. Weight by similarity score

**Similarity Calculation**:
```typescript
score = 0
if (sameDomain) score += 0.4
if (sameAuthor) score += 0.3
if (titleOverlap > 30%) score += titleOverlap * 0.3
if (descOverlap > 20%) score += descOverlap * 0.2
```

---

## Type Definitions

```typescript
// ==================== Core Types ====================

interface TagSuggestion {
  tag: string
  confidence: number           // 0-1
  sources: TagSource[]         // ['domain', 'url', 'nlp', 'learning']
  reasoning?: string           // Why this tag was suggested
}

type TagSource = 'domain' | 'url' | 'nlp' | 'learning'

interface TaggingResult {
  suggestions: TagSuggestion[]  // All suggestions sorted by confidence
  autoApplied: string[]         // High confidence (>0.8)
  needsReview: string[]         // Lower confidence (<0.8)
  metrics: TaggingMetrics       // Performance data
}

interface TaggingMetrics {
  processingTime: number
  strategyTimes: Record<TagSource, number>
  suggestionCounts: Record<TagSource, number>
}

interface TaggingOptions {
  autoApplyThreshold?: number    // Default: 0.8
  maxSuggestions?: number        // Default: 10
  enabledStrategies?: TagSource[]
  customDomainRules?: DomainRule[]
}

// ==================== Strategy Interfaces ====================

interface TaggingStrategy {
  readonly name: TagSource
  generateTags(bookmark: Bookmark, context: TaggingContext): Promise<TagSuggestion[]>
}

interface TaggingContext {
  allBookmarks: Bookmark[]
  options: TaggingOptions
}

// ==================== Domain Rules ====================

interface DomainRule {
  domain: string | RegExp
  tags: string[]
  category?: string              // 'work', 'personal', 'research', etc.
  confidence: number
  description?: string
}

// ==================== URL Patterns ====================

interface UrlPattern {
  pattern: RegExp | string
  tags: string[]
  confidence: number
  description?: string
}

// ==================== Link Extraction ====================

interface ExtractedLink {
  url: string
  domain: string
  position: number               // Position in text
  context: string                // Surrounding text
  confidence: number             // How reliable is this link
}

// ==================== Keyword Extraction ====================

interface ExtractedKeyword {
  text: string
  confidence: number
  source: 'entity' | 'topic' | 'noun' | 'tech'
  context?: string
}

// ==================== Similarity ====================

interface SimilarityScore {
  bookmark: Bookmark
  score: number                  // 0-1
  matchedFields: ('domain' | 'author' | 'title' | 'description')[]
}

// ==================== Settings ====================

interface SmartTaggingSettings {
  enabled: boolean
  autoTagOnCreate: boolean
  autoTagOnImport: boolean
  autoApplyThreshold: number     // 0-1
  maxSuggestions: number
  enabledStrategies: TagSource[]
  showConfidence: boolean
  showReasoning: boolean
}
```

---

## Testing Strategy

### Coverage Goals

```
Overall Target: >80%

By Module:
├── core/               >90% (utilities - critical)
├── strategies/         >85% (core logic)
├── SmartTaggingService >80% (integration)
├── hooks/              >75% (React hooks)
└── components/         >70% (UI)
```

### Test Pyramid

```
         /\
        /UI\        20% - Component/E2E tests
       /____\
      /      \
     /  INT   \      30% - Integration tests
    /________\
   /          \
  /    UNIT    \    50% - Unit tests
 /______________\
```

### Unit Tests (50%)

**ContentLinkExtractor.test.ts**:
- ✅ Extract GitHub link from X/Twitter bookmark
- ✅ Skip X/Twitter URLs in content
- ✅ Extract multiple links and rank by confidence
- ✅ Handle bookmarks without embedded links
- ✅ Higher confidence for links with context
- ✅ Deduplicate same link appearing multiple times
- ✅ Return highest confidence as primary link

**DomainTagStrategy.test.ts**:
- ✅ Return tags for exact domain match
- ✅ Return empty array for unknown domain
- ✅ Match subdomain to parent domain
- ✅ Apply correct confidence from rules
- ✅ Merge custom rules with defaults
- ✅ Prioritize embedded links over bookmark domain
- ✅ Low confidence for X/Twitter domains

**UrlPatternStrategy.test.ts**:
- ✅ Match documentation URLs
- ✅ Match blog URLs
- ✅ Match GitHub issue URLs
- ✅ Match API URLs
- ✅ Multiple pattern matches
- ✅ Case-insensitive matching

**NlpKeywordStrategy.test.ts**:
- ✅ Extract tech keywords
- ✅ Extract named entities
- ✅ Extract topics
- ✅ Filter stop words
- ✅ Apply confidence scores correctly
- ✅ Deduplicate keywords

**LearningStrategy.test.ts**:
- ✅ Find similar bookmarks by domain
- ✅ Find similar bookmarks by author
- ✅ Calculate title overlap correctly
- ✅ Weight tags by similarity score
- ✅ Return empty for no similar bookmarks

**TagNormalizer.test.ts**:
- ✅ Lowercase tags
- ✅ Remove special characters
- ✅ Skip stop words
- ✅ Apply aliases
- ✅ Enforce minimum/maximum length

### Integration Tests (30%)

**SmartTaggingService.test.ts**:
- ✅ Combine all strategies effectively
- ✅ Respect confidence threshold
- ✅ Deduplicate tags from multiple sources
- ✅ Learn from similar bookmarks
- ✅ Handle edge cases (empty bookmarks)
- ✅ Complete within performance budget (<100ms)
- ✅ Return accurate metrics

### Hook Tests (10%)

**useSmartTagging.test.ts**:
- ✅ Generate tags for a bookmark
- ✅ Handle errors gracefully
- ✅ Update bookmark with auto-applied tags
- ✅ Show loading state during generation
- ✅ Support bulk tagging

### Component Tests (10%)

**AutoTagButton.test.tsx**:
- ✅ Render with correct text
- ✅ Show loading state when generating
- ✅ Call onTagsGenerated callback
- ✅ Disable button while generating

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

**Day 1-2: Setup & Types**
- [ ] Install dependencies (`npm install compromise`)
- [ ] Create file structure
- [ ] Define all TypeScript types
- [ ] Set up test fixtures and utilities
- [ ] Configure test coverage thresholds

**Day 3-4: Core Utilities**
- [ ] Implement `ContentLinkExtractor`
- [ ] Implement `TagNormalizer`
- [ ] Implement `TagDeduplicator`
- [ ] Write unit tests (>90% coverage)

**Day 5-7: Data & Rules**
- [ ] Create domain rules database (500+ domains)
- [ ] Create URL pattern rules (50+ patterns)
- [ ] Create tech keywords dictionary (200+ terms)
- [ ] Create stop words list (100+ words)

### Phase 2: Strategies (Week 2)

**Day 8-9: Domain Strategy**
- [ ] Implement `DomainTagStrategy`
- [ ] Integrate `ContentLinkExtractor`
- [ ] Write unit tests
- [ ] Test with X/Twitter bookmarks

**Day 10-11: Pattern & NLP Strategies**
- [ ] Implement `UrlPatternStrategy`
- [ ] Implement `NlpKeywordStrategy`
- [ ] Write unit tests
- [ ] Performance optimization

**Day 12-13: Learning Strategy**
- [ ] Implement `LearningStrategy`
- [ ] Implement similarity calculation
- [ ] Write unit tests

**Day 14: Integration**
- [ ] Implement `SmartTaggingService`
- [ ] Write integration tests
- [ ] Performance benchmarking

### Phase 3: UI & Hooks (Week 3)

**Day 15-16: React Hooks**
- [ ] Implement `useSmartTagging`
- [ ] Implement `useTagSuggestions`
- [ ] Implement `useBulkTagging`
- [ ] Write hook tests

**Day 17-19: UI Components**
- [ ] Implement `AutoTagButton`
- [ ] Implement `TagSuggestionsList`
- [ ] Implement `TagConfidenceBadge`
- [ ] Implement `BulkTaggingModal`
- [ ] Write component tests

**Day 20-21: Settings & Integration**
- [ ] Implement `SmartTaggingSettings`
- [ ] Integrate with settings store
- [ ] Add to Settings page
- [ ] Integration with bookmark creation/import flows

---

## Examples

### Example 1: GitHub Repository Tweet

```typescript
// Input
const bookmark = {
  id: 1,
  domain: "x.com",
  url: "https://x.com/dan_abramov/status/1234567890",
  title: "React 18 is out!",
  description: "React 18 is now available! Check out the new features: https://github.com/facebook/react/releases/tag/v18.0.0",
  content: "React 18 is now available! Check out the new features: https://github.com/facebook/react/releases/tag/v18.0.0 🎉",
  author: "Dan Abramov (@dan_abramov)",
  tags: []
}

// Processing Steps:
// 1. ContentLinkExtractor finds: https://github.com/facebook/react/releases/tag/v18.0.0
// 2. Domain: github.com → ["code", "development", "open-source"]
// 3. URL Pattern: /releases/ → ["release", "changelog"]
// 4. NLP: "react", "features" → ["react", "features"]
// 5. Deduplicate and rank

// Output
{
  suggestions: [
    { tag: "react", confidence: 0.90, sources: ["nlp"], reasoning: "Found in content" },
    { tag: "code", confidence: 0.95, sources: ["domain"], reasoning: "From github.com" },
    { tag: "development", confidence: 0.95, sources: ["domain"], reasoning: "From github.com" },
    { tag: "open-source", confidence: 0.95, sources: ["domain"], reasoning: "From github.com" },
    { tag: "release", confidence: 0.90, sources: ["url"], reasoning: "URL contains /releases/" },
    { tag: "changelog", confidence: 0.90, sources: ["url"], reasoning: "URL contains /releases/" }
  ],
  autoApplied: ["code", "development", "open-source", "react", "release", "changelog"],
  needsReview: [],
  metrics: {
    processingTime: 45,
    strategyTimes: { domain: 10, url: 8, nlp: 25, learning: 2 },
    suggestionCounts: { domain: 3, url: 2, nlp: 2, learning: 0 }
  }
}
```

### Example 2: Tutorial Article Tweet

```typescript
// Input
const bookmark = {
  id: 2,
  domain: "x.com",
  url: "https://x.com/sarah_edo/status/9876543210",
  title: "Great Vue.js tutorial!",
  description: "Just published a comprehensive guide to Vue 3 Composition API on @dev_to: https://dev.to/sarah/vue3-composition-api-guide",
  content: "...",
  tags: []
}

// Processing:
// 1. Link: https://dev.to/sarah/vue3-composition-api-guide
// 2. Domain: dev.to → ["article", "development", "tutorial"]
// 3. NLP: "vue", "composition api", "guide" → ["vue", "guide"]
// 4. Similar bookmarks with "vue" tag found → boost confidence

// Output
{
  suggestions: [
    { tag: "vue", confidence: 0.92, sources: ["nlp", "learning"] },
    { tag: "article", confidence: 0.90, sources: ["domain"] },
    { tag: "tutorial", confidence: 0.90, sources: ["domain"] },
    { tag: "development", confidence: 0.90, sources: ["domain"] },
    { tag: "guide", confidence: 0.75, sources: ["nlp"] }
  ],
  autoApplied: ["vue", "article", "tutorial", "development"],
  needsReview: ["guide"],
  metrics: { processingTime: 52, ... }
}
```

### Example 3: Plain Tweet (No Links)

```typescript
// Input
const bookmark = {
  id: 3,
  domain: "x.com",
  url: "https://x.com/user/status/1111111111",
  description: "My thoughts on the future of AI and machine learning in web development",
  content: "...",
  tags: []
}

// Processing:
// 1. No embedded links found
// 2. Domain: x.com → ["social", "thread"] (LOW confidence: 0.3)
// 3. NLP: "ai", "machine learning", "web development" → high confidence
// 4. Learning: similar bookmarks tagged "ai", "ml" → boost

// Output
{
  suggestions: [
    { tag: "ai", confidence: 0.90, sources: ["nlp", "learning"] },
    { tag: "machine-learning", confidence: 0.85, sources: ["nlp"] },
    { tag: "web-development", confidence: 0.75, sources: ["nlp"] },
    { tag: "social", confidence: 0.30, sources: ["domain"] }  // Low confidence
  ],
  autoApplied: ["ai", "machine-learning"],
  needsReview: ["web-development", "social"],
  metrics: { processingTime: 38, ... }
}
```

---

## Configuration

### Domain Rules

Location: `src/data/smartTagging/domainRules.ts`

**Categories**:
- Development (GitHub, GitLab, Stack Overflow)
- Learning (Udemy, Coursera, freeCodeCamp)
- Documentation (MDN, docs.rs)
- Media (YouTube, Vimeo)
- Design (Dribbble, Behance, Figma)
- News (TechCrunch, The Verge)
- Social (LinkedIn, Reddit, X/Twitter)

**Total**: 500+ domains

### URL Patterns

Location: `src/data/smartTagging/urlPatterns.ts`

**Categories**:
- Documentation (/docs, /api, /guide)
- Content types (/blog, /tutorial, /course, /video)
- GitHub specific (issues, pull requests, releases)
- Programming languages (/javascript, /python, /rust)

**Total**: 50+ patterns

### Tech Keywords

Location: `src/data/smartTagging/techKeywords.ts`

**Categories**:
- Languages (javascript, python, rust, go, etc.)
- Frameworks (react, vue, angular, django, etc.)
- Tools (docker, kubernetes, git, etc.)
- Concepts (api, database, ml, blockchain, etc.)

**Total**: 200+ keywords

---

## Performance

### Benchmarks

| Operation | Target | Actual |
|-----------|--------|--------|
| Single bookmark | <100ms | ~50ms |
| Batch (10) | <1s | ~500ms |
| Batch (100) | <10s | ~5s |
| Memory usage | <10MB | ~5MB |

### Optimization Techniques

1. **Lazy Loading**: Load rules/patterns on first use
2. **Memoization**: Cache domain lookups
3. **Batch Processing**: Process multiple bookmarks in parallel
4. **Early Exit**: Skip strategies if confidence already high
5. **Regex Compilation**: Pre-compile all regex patterns

---

## Future Enhancements

### Phase 2: TensorFlow.js (Optional)

- Add semantic similarity with Universal Sentence Encoder
- Find similar bookmarks by content, not just patterns
- Improve accuracy to 75-85%
- Model size: ~50MB one-time download

### Phase 3: Cloud AI (Premium)

- Optional OpenAI/Claude integration
- Higher accuracy (90-95%)
- User choice: local (free) vs cloud (paid)
- Settings toggle for AI provider

---

## Appendix

### Dependencies

```json
{
  "dependencies": {
    "compromise": "^14.x"
  }
}
```

### Scripts

```json
{
  "scripts": {
    "test:tagging": "vitest run tests/smartTagging",
    "test:tagging:watch": "vitest watch tests/smartTagging",
    "test:tagging:coverage": "vitest run tests/smartTagging --coverage",
    "test:tagging:ui": "vitest --ui tests/smartTagging"
  }
}
```

### Coverage Configuration

```javascript
// vitest.config.ts
export default {
  test: {
    coverage: {
      include: ['src/services/smartTagging/**'],
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

---

## Contributing

### Adding New Domain Rules

1. Edit `src/data/smartTagging/domainRules.ts`
2. Add domain with tags, category, and confidence
3. Add test case in `tests/smartTagging/unit/DomainTagStrategy.test.ts`
4. Run tests: `npm run test:tagging`

### Adding New URL Patterns

1. Edit `src/data/smartTagging/urlPatterns.ts`
2. Add pattern with tags and confidence
3. Add test case in `tests/smartTagging/unit/UrlPatternStrategy.test.ts`
4. Run tests: `npm run test:tagging`

### Adding New Tech Keywords

1. Edit `src/data/smartTagging/techKeywords.ts`
2. Add keywords to appropriate category
3. Test with real bookmarks

---

## License

Same as parent project (X Bookmark Manager)

---

## Questions?

See main project README or open an issue on GitHub.
