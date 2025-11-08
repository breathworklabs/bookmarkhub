/**
 * Twitter Archive Import Service
 * Main entry point for importing bookmarks from Twitter data archives
 */

import { extractBookmarksFromZip, validateZipFile } from './zipProcessor'
import { parseTwitterArchive, validateParsedBookmarks } from './archiveParser'
import { transformTwitterBookmarks } from './dataTransformer'
import { ImportExportError } from '../../utils/errorHandling'
import type { ImportResult, ProgressCallback } from './types'

/**
 * Import bookmarks from Twitter archive ZIP file
 *
 * @param file Twitter archive ZIP file
 * @param userId User ID for imported bookmarks
 * @param onProgress Optional progress callback
 * @returns Import result with transformed bookmarks
 */
export async function importTwitterArchive(
  file: File,
  userId: string = 'local-user',
  onProgress?: ProgressCallback
): Promise<ImportResult> {
  try {
    // Step 1: Validate ZIP file
    const validation = validateZipFile(file)
    if (!validation.valid) {
      throw ImportExportError.invalidFormat(
        validation.error || 'Invalid ZIP file'
      )
    }

    // Step 2: Extract bookmarks.js from ZIP
    const fileContent = await extractBookmarksFromZip(file, onProgress)

    // Step 3: Parse Twitter archive format
    const parsedBookmarks = parseTwitterArchive(fileContent, onProgress)

    // Step 4: Validate parsed bookmarks
    const parsedValidation = validateParsedBookmarks(parsedBookmarks)
    if (!parsedValidation.valid) {
      throw ImportExportError.importFailed(
        `Invalid bookmark data: ${parsedValidation.errors.join(', ')}`
      )
    }

    // Step 5: Transform to BookmarkInsert format
    const bookmarks = transformTwitterBookmarks(
      parsedBookmarks,
      userId,
      onProgress
    )

    onProgress?.({
      phase: 'complete',
      current: bookmarks.length,
      total: bookmarks.length,
      message: `Successfully imported ${bookmarks.length} bookmarks`,
    })

    return {
      success: true,
      imported: bookmarks.length,
      skipped: parsedBookmarks.length - bookmarks.length,
      errors: [],
      bookmarks,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    onProgress?.({
      phase: 'error',
      current: 0,
      total: 0,
      message: errorMessage,
    })

    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [errorMessage],
    }
  }
}

// Re-export types for convenience
export type { ImportResult, ImportProgress, ProgressCallback } from './types'
export { validateZipFile } from './zipProcessor'
