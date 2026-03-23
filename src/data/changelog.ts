export interface ChangelogEntry {
  version: string // "YYYY-MM-DD" — used as comparison key
  title: string
  date: string // human-readable
  changes: { type: 'feature' | 'improvement' | 'fix'; description: string }[]
}

export const CHANGELOG: ChangelogEntry[] = [
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
