/**
 * ZIP file processing for Twitter Archive imports
 * Extracts and reads bookmarks.js from Twitter data archives
 */

import JSZip from 'jszip'
import { ImportExportError } from '@/utils/errorHandling'
import type { ProgressCallback } from './types'

/**
 * Maximum file size for ZIP archives (100MB)
 */
const MAX_FILE_SIZE = 100 * 1024 * 1024

/**
 * Expected location of bookmarks.js in Twitter archive
 */
const BOOKMARKS_FILE_PATHS = [
  'data/bookmarks.js',
  'data/bookmark.js',
  'bookmarks.js',
  'bookmark.js',
]

/**
 * Extract bookmarks.js content from Twitter archive ZIP
 * @param file ZIP file from user upload
 * @param onProgress Optional progress callback
 * @returns Content of bookmarks.js file
 */
export async function extractBookmarksFromZip(
  file: File,
  onProgress?: ProgressCallback
): Promise<string> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw ImportExportError.fileTooLarge(file.size, MAX_FILE_SIZE)
  }

  // Validate file type
  if (!file.name.toLowerCase().endsWith('.zip')) {
    throw ImportExportError.invalidFormat('Only .zip files are supported')
  }

  onProgress?.({
    phase: 'extracting',
    current: 0,
    total: 100,
    message: 'Extracting archive...',
  })

  try {
    // Load ZIP file
    const zip = await JSZip.loadAsync(file)

    onProgress?.({
      phase: 'extracting',
      current: 50,
      total: 100,
      message: 'Archive loaded, searching for bookmarks.js...',
    })

    // Try to find bookmarks.js in various possible locations
    let bookmarksFile: JSZip.JSZipObject | null = null

    for (const path of BOOKMARKS_FILE_PATHS) {
      bookmarksFile = zip.file(path)
      if (bookmarksFile) {
        break
      }
    }

    // Also try case-insensitive search
    if (!bookmarksFile) {
      const files = Object.keys(zip.files)
      const bookmarksPath = files.find(
        (path) =>
          path.toLowerCase().includes('bookmark') &&
          path.toLowerCase().endsWith('.js')
      )

      if (bookmarksPath) {
        bookmarksFile = zip.file(bookmarksPath)
      }
    }

    if (!bookmarksFile) {
      throw ImportExportError.importFailed(
        'Could not find bookmarks.js in archive. Please ensure this is a valid Twitter data archive.'
      )
    }

    onProgress?.({
      phase: 'extracting',
      current: 75,
      total: 100,
      message: 'Reading bookmarks file...',
    })

    // Read file content
    const content = await bookmarksFile.async('text')

    onProgress?.({
      phase: 'extracting',
      current: 100,
      total: 100,
      message: 'Extraction complete',
    })

    return content
  } catch (error) {
    if (error instanceof ImportExportError) {
      throw error
    }

    throw ImportExportError.importFailed(
      `Failed to extract archive: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Validate ZIP file before processing
 * @param file File to validate
 * @returns Validation result
 */
export function validateZipFile(file: File): {
  valid: boolean
  error?: string
} {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${Math.round(file.size / 1024 / 1024)}MB (max: ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
    }
  }

  // Check file extension
  if (!file.name.toLowerCase().endsWith('.zip')) {
    return {
      valid: false,
      error: 'Invalid file type. Only .zip files are supported.',
    }
  }

  return { valid: true }
}
