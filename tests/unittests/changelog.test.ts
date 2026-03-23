import { describe, it, expect } from 'vitest'
import { CHANGELOG, LATEST_CHANGELOG_VERSION } from '../../src/data/changelog'

describe('Changelog data', () => {
  it('should have at least one entry', () => {
    expect(CHANGELOG.length).toBeGreaterThan(0)
  })

  it('should export LATEST_CHANGELOG_VERSION matching the first entry', () => {
    expect(LATEST_CHANGELOG_VERSION).toBe(CHANGELOG[0].version)
  })

  it('should have entries ordered newest first (descending version)', () => {
    for (let i = 0; i < CHANGELOG.length - 1; i++) {
      expect(CHANGELOG[i].version > CHANGELOG[i + 1].version).toBe(true)
    }
  })

  it('each entry should have required fields', () => {
    for (const entry of CHANGELOG) {
      expect(entry.version).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(entry.title).toBeTruthy()
      expect(entry.date).toBeTruthy()
      expect(entry.changes.length).toBeGreaterThan(0)
    }
  })

  it('each change should have a valid type', () => {
    const validTypes = ['feature', 'improvement', 'fix']
    for (const entry of CHANGELOG) {
      for (const change of entry.changes) {
        expect(validTypes).toContain(change.type)
        expect(change.description).toBeTruthy()
      }
    }
  })
})
