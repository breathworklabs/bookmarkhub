export interface ChangelogEntry {
  version: string // "YYYY-MM-DD" — used as comparison key
  title: string
  date: string // human-readable
  changes: { type: 'feature' | 'improvement' | 'fix'; description: string }[]
}

export const CHANGELOG: ChangelogEntry[] = [
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
