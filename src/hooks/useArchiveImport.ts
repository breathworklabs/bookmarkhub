/**
 * React hook for Twitter Archive import
 * Manages import state and integrates with bookmark store
 */

import { useState, useCallback } from 'react'
import { useBookmarkStore } from '../store/bookmarkStore'
import {
  importTwitterArchive,
  validateZipFile,
} from '../services/twitterArchiveImport'
import { sanitizeBookmark } from '../lib/dataValidation'
import { localStorageService } from '../lib/localStorage'
import type {
  ImportResult,
  ImportProgress,
} from '../services/twitterArchiveImport'

interface UseArchiveImportState {
  isImporting: boolean
  progress: ImportProgress | null
  result: ImportResult | null
  error: string | null
}

interface UseArchiveImportReturn extends UseArchiveImportState {
  importArchive: (file: File) => Promise<void>
  reset: () => void
}

/**
 * Hook for importing Twitter Archive bookmarks
 *
 * Usage:
 * ```tsx
 * const { importArchive, isImporting, progress, result, error } = useArchiveImport()
 *
 * const handleFileUpload = async (file: File) => {
 *   await importArchive(file)
 * }
 * ```
 */
export function useArchiveImport(): UseArchiveImportReturn {
  const [state, setState] = useState<UseArchiveImportState>({
    isImporting: false,
    progress: null,
    result: null,
    error: null,
  })

  const loadBookmarks = useBookmarkStore((state) => state.loadBookmarks)
  const addActivityLog = useBookmarkStore((state) => state.addActivityLog)

  /**
   * Import Twitter Archive ZIP file
   */
  const importArchive = useCallback(
    async (file: File) => {
      // Reset state
      setState({
        isImporting: true,
        progress: null,
        result: null,
        error: null,
      })

      try {
        // Validate file first
        const validation = validateZipFile(file)
        if (!validation.valid) {
          setState((prev) => ({
            ...prev,
            isImporting: false,
            error: validation.error || 'Invalid file',
          }))
          return
        }

        // Import with progress tracking
        const result = await importTwitterArchive(
          file,
          'local-user',
          (progress) => {
            setState((prev) => ({
              ...prev,
              progress,
            }))
          }
        )

        if (!result.success) {
          setState((prev) => ({
            ...prev,
            isImporting: false,
            result,
            error: result.errors.join(', '),
          }))
          return
        }

        // Save bookmarks to storage
        if (result.bookmarks && result.bookmarks.length > 0) {
          setState((prev) => ({
            ...prev,
            progress: {
              phase: 'saving',
              current: 0,
              total: result.bookmarks!.length,
              message: 'Saving bookmarks...',
            },
          }))

          let savedCount = 0
          const errors: string[] = []

          for (let i = 0; i < result.bookmarks.length; i++) {
            try {
              const bookmark = result.bookmarks[i]
              const sanitized = sanitizeBookmark(bookmark)

              if (sanitized) {
                await localStorageService.createBookmark(sanitized)
                savedCount++

                // Update progress every 10 bookmarks
                if (i % 10 === 0) {
                  setState((prev) => ({
                    ...prev,
                    progress: {
                      phase: 'saving',
                      current: i,
                      total: result.bookmarks!.length,
                      message: `Saving ${i}/${result.bookmarks!.length} bookmarks...`,
                    },
                  }))
                }
              }
            } catch (error) {
              errors.push(
                `Failed to save bookmark ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`
              )
            }
          }

          // Reload bookmarks from storage
          await loadBookmarks()

          // Log activity
          addActivityLog('Imported Twitter Archive', `${savedCount} bookmarks`)

          // Update final result
          const finalResult: ImportResult = {
            success: true,
            imported: savedCount,
            skipped: result.bookmarks.length - savedCount,
            errors,
          }

          setState({
            isImporting: false,
            progress: {
              phase: 'complete',
              current: savedCount,
              total: result.bookmarks.length,
              message: `Import complete: ${savedCount} bookmarks saved`,
            },
            result: finalResult,
            error:
              errors.length > 0
                ? `${errors.length} bookmarks failed to save`
                : null,
          })
        } else {
          setState({
            isImporting: false,
            progress: null,
            result,
            error: 'No bookmarks found in archive',
          })
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred'

        setState({
          isImporting: false,
          progress: null,
          result: {
            success: false,
            imported: 0,
            skipped: 0,
            errors: [errorMessage],
          },
          error: errorMessage,
        })
      }
    },
    [loadBookmarks, addActivityLog]
  )

  /**
   * Reset import state
   */
  const reset = useCallback(() => {
    setState({
      isImporting: false,
      progress: null,
      result: null,
      error: null,
    })
  }, [])

  return {
    ...state,
    importArchive,
    reset,
  }
}
