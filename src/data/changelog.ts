export interface ChangelogEntry {
  version: string // "YYYY-MM-DD" — used as comparison key
  title: string
  date: string // human-readable
  changes: { type: 'feature' | 'improvement' | 'fix'; description: string }[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2026-04-16',
    title: 'Unified Views System',
    date: 'April 16, 2026',
    changes: [
      { type: 'feature', description: 'Collections replaced by a unified Views system with system views (All, Starred, Recent, Archived, Trash, Uncategorized) and custom views' },
      { type: 'feature', description: 'Smart criteria-based views that auto-filter bookmarks by starred, recent, archived, tags, domains, and more' },
      { type: 'feature', description: 'Hierarchical views with nested sub-views for deeper organization' },
      { type: 'feature', description: 'Filter presets — save and load custom filter combinations for quick switching' },
      { type: 'improvement', description: 'Context menu works correctly when right-clicking between different views' },
      { type: 'improvement', description: 'Automatic migration from old collections to new views with bookmark hierarchy and share settings preserved' },
      { type: 'improvement', description: 'System views auto-reconcile on load so existing users always get the latest criteria' },
      { type: 'improvement', description: 'Tour updated to reflect the new Views terminology and current UI' },
      { type: 'fix', description: 'Fixed archived smart view showing wrong bookmarks' },
    ],
  },
  {
    version: '2026-03-29',
    title: 'Share Collections Feature',
    date: 'March 29, 2026',
    changes: [
      { type: 'feature', description: 'Share your bookmark collections with generate shareable links' },
      { type: 'feature', description: 'Set expiration dates (7 days, 30 days, or never) and access limits on shared collections' },
      { type: 'feature', description: 'View beautiful public collection pages at bookmarkhub.app/s/{id}' },
      { type: 'improvement', description: 'Import shared collections directly into your own library' },
    ],
  },
  {
    version: '2026-03-23',
    title: 'March 2026 Update',
    date: 'March 23, 2026',
    changes: [
      { type: 'feature', description: "What's New changelog to keep you informed of updates" },
      { type: 'fix', description: 'Fixed stale state when moving bookmarks to collections' },
      { type: 'fix', description: 'Clear demo bookmarks from localStorage on extension import' },
    ],
  },
]

// Always the newest entry's version
export const LATEST_CHANGELOG_VERSION = CHANGELOG[0].version
