import type {
  CreateShareRequest,
  CreateShareResponse,
  SharedCollection,
  ShareError,
} from '@/types/share'

// API base URL - will be configured for production
const API_BASE_URL =
  import.meta.env.VITE_SHARE_API_URL ||
  'https://bookmarkhub-share-api.bartlomiej-sobera.workers.dev'

const SHARE_BASE_URL =
  import.meta.env.VITE_SHARE_BASE_URL ||
  'https://bookmarkhub.app/s'

/**
 * Create a new shared collection
 */
export async function createShare(
  request: CreateShareRequest
): Promise<CreateShareResponse> {
  const response = await fetch(`${API_BASE_URL}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error: ShareError = await response.json().catch(() => ({
      error: 'Failed to create share link',
      code: 'SERVER_ERROR' as const,
    }))
    throw new Error(error.error)
  }

  const data = await response.json()
  return {
    id: data.id,
    shareUrl: `${SHARE_BASE_URL}/${data.id}`,
    expiresAt: data.expiresAt,
  }
}

/**
 * Get a shared collection by ID
 * Returns null if not found or expired
 */
export async function getShare(
  shareId: string
): Promise<SharedCollection | null> {
  const response = await fetch(`${API_BASE_URL}/share/${shareId}`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    const error: ShareError = await response.json().catch(() => ({
      error: 'Failed to fetch shared collection',
      code: 'SERVER_ERROR' as const,
    }))
    throw new Error(error.error)
  }

  return response.json()
}

/**
 * Revoke (delete) a shared collection
 * This is called from the owner's side to stop sharing
 */
export async function revokeShare(shareId: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/share/${shareId}`, {
    method: 'DELETE',
  })

  return response.ok
}

/**
 * Generate the full share URL for a given share ID
 */
export function getShareUrl(shareId: string): string {
  return `${SHARE_BASE_URL}/${shareId}`
}

/**
 * Generate Twitter share text for a collection
 */
export function getTwitterShareText(
  collectionName: string,
  bookmarkCount: number,
  shareUrl: string
): string {
  return `Check out my curated "${collectionName}" collection - ${bookmarkCount} bookmarks organized with @BookmarkHub\n\n${shareUrl}`
}

/**
 * Open Twitter share dialog
 */
export function shareOnTwitter(
  collectionName: string,
  bookmarkCount: number,
  shareUrl: string
): void {
  const text = getTwitterShareText(collectionName, bookmarkCount, shareUrl)
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
  window.open(twitterUrl, '_blank', 'noopener,noreferrer')
}

/**
 * Copy share URL to clipboard
 */
export async function copyShareUrl(shareUrl: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(shareUrl)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = shareUrl
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}
