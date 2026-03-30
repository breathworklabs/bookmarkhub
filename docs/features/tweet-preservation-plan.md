# Tweet Preservation Archive

## Context

Tweet bookmarks reference external Twitter CDN URLs for images and link to live tweets. If a tweet is deleted or Twitter/X is unavailable, those bookmarks become broken. This feature creates **tweet snapshots as screenshot images** (PNG) uploaded to **Cloudflare R2**, making them publicly accessible. Other users can reference the same screenshot URL. It also **fetches conversation context** (parent tweets, replies) as regular bookmarks.

**Scope:** Screenshot-based preservation (PNG) stored in Cloudflare R2. Public URLs. Conversation tweets fetched via Chrome extension. Images only (no video in Phase 1).

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│  Client: BookmarkCard (DOM element)               │
│       ↓ html2canvas → PNG Blob                    │
│       ↓ POST /preserve/{tweetId} → Worker API     │
│       ↓ R2.put(screenshot-{tweetId}.png)          │
│       ↓ Returns: { url: "https://.../{tweetId}" } │
│                                                    │
│  Bookmark metadata updated with:                   │
│    preservation.screenshot_url (public R2 URL)     │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  Other users:                                     │
│    See screenshot_url in bookmark metadata         │
│    → <img src={screenshot_url} />                 │
│    → Works offline if cached, shared across users  │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  Chrome Extension:                                │
│  → Fetch parent tweet (in_reply_to_status_id)     │
│  → Import as regular bookmark with "conversation"  │
│    tag                                            │
└──────────────────────────────────────────────────┘
```

**Storage:**
- **Cloudflare R2** (`bookmarkhub-preserve`) — screenshot PNG files, publicly accessible
- **localStorage** — preservation metadata (status, screenshot URL, timestamp) on each bookmark
- **No IndexedDB needed** — images are served from R2, browser caching handles offline

**Key insight:** Since screenshots are stored at public URLs, any user who has the bookmark (via shared collections, import, etc.) can see the preserved screenshot. No local blob storage needed.

---

## Infrastructure Setup (Cloudflare)

### R2 Bucket
Create a new R2 bucket: `bookmarkhub-preserve`
- Enable public access via custom domain or R2 public bucket URL
- Public URL pattern: `https://preserve.bookmarkhub.app/{tweetId}.png`

### Worker Updates
Extend existing `bookmarkhub-share-api` worker with new endpoints:

```
POST /preserve/:tweetId    → Upload screenshot PNG to R2
GET  /preserve/:tweetId    → Serve screenshot from R2 (or redirect to R2 public URL)
DELETE /preserve/:tweetId  → Delete screenshot from R2
```

**wrangler.toml additions:**
```toml
[[r2_buckets]]
binding = "PRESERVE"
bucket_name = "bookmarkhub-preserve"
```

---

## Data Model

### New types in `src/types/bookmark.ts`

```typescript
export type PreservationStatus = 'none' | 'preserving' | 'complete' | 'failed'

export interface PreservationData {
  status: PreservationStatus
  screenshot_url: string     // Public R2 URL (e.g., https://preserve.bookmarkhub.app/{tweetId}.png)
  preserved_at: string       // ISO timestamp
  size_bytes?: number        // PNG file size (from upload response)
}
```

### Extend Bookmark interface

```typescript
// Add optional field to existing Bookmark interface
preservation?: PreservationData
```

---

## Implementation Steps

### Step 1: R2 Infrastructure

**Modify:** `workers/share-api/wrangler.toml`

Add R2 bucket binding:
```toml
[[r2_buckets]]
binding = "PRESERVE"
bucket_name = "bookmarkhub-preserve"
```

Create R2 bucket:
```bash
npx wrangler r2 bucket create bookmarkhub-preserve
```

Enable public access (either via R2 custom domain or public bucket setting).

### Step 2: Worker API Endpoints

**Modify:** `workers/share-api/src/index.ts`

Add new routes to the existing worker:

```typescript
// Update Env interface
interface Env {
  SHARES: KVNamespace
  PRESERVE: R2Bucket
  CORS_ORIGIN: string
  PRESERVE_PUBLIC_URL: string  // e.g., "https://preserve.bookmarkhub.app"
}

// POST /preserve/:tweetId — Upload screenshot
// - Accepts multipart/form-data with PNG blob
// - Stores as {tweetId}.png in R2
// - Returns { url: publicUrl, size: bytes }

// GET /preserve/:tweetId — Serve screenshot
// - Redirects to R2 public URL (or serves directly from R2)

// DELETE /preserve/:tweetId — Delete screenshot
// - Deletes object from R2
```

Key implementation details:
- **Size limit:** Max 2MB per screenshot (enough for retina tweet cards)
- **Content-Type:** `image/png`
- **Validation:** Check `Content-Type` header, verify PNG magic bytes
- **CORS:** Same origin allowlist as existing share endpoints
- **Rate limiting:** Optional — Cloudflare handles basic DDoS protection

### Step 3: Add `html2canvas` Dependency

```bash
npm install html2canvas
```

### Step 4: Preservation API Client

**New file:** `src/lib/preservationApi.ts`

Client-side API wrapper (follows existing `shareApi.ts` pattern):

```typescript
const PRESERVE_API_BASE = import.meta.env.VITE_PRESERVE_API_URL || API_BASE_URL

export async function uploadScreenshot(tweetId: string, pngBlob: Blob): Promise<PreservationUploadResponse>
export async function deleteScreenshot(tweetId: string): Promise<boolean>
export function getScreenshotUrl(tweetId: string): string
```

### Step 5: Screenshot Service

**New file:** `src/services/preservation/screenshotService.ts`

Captures tweet cards as PNG:
- `captureScreenshot(element: HTMLElement)` → `Promise<Blob>`
  - Uses `html2canvas(element, { backgroundColor: null, scale: 2 })` for retina quality
  - Returns PNG blob
- `captureOffscreen(bookmark: Bookmark)` → `Promise<Blob>`
  - Renders BookmarkCard in hidden container via ReactDOM
  - Captures with html2canvas
  - Unmounts and returns blob

### Step 6: Preservation Service (orchestrator)

**New file:** `src/services/preservation/preservationService.ts`

- `preserveBookmark(bookmark: Bookmark, cardElement?: HTMLElement)` → `Promise<PreservationData>`
  1. Capture screenshot (from visible card or offscreen render)
  2. Upload to R2 via `preservationApi.uploadScreenshot()`
  3. Update bookmark with `preservation` metadata
  4. Persist to localStorage
  5. Return preservation data
- `removePreservation(bookmark: Bookmark)` — delete from R2, clear metadata
- `getScreenshotUrl(bookmark: Bookmark)` → `string | null` — return public R2 URL if preserved

**New file:** `src/services/preservation/index.ts` — barrel export

### Step 7: Extend Bookmark Type

**Modify:** `src/types/bookmark.ts`

Add `PreservationStatus`, `PreservationData` types and optional `preservation?: PreservationData` to `Bookmark` interface.

### Step 8: Bookmark Store Integration

**Modify:** `src/store/bookmarkStore.ts`

New actions:
- `preserveBookmark(id: number)` — call screenshot service → upload → update bookmark
- `preserveSelectedBookmarks()` — batch with progress tracking
- `removePreservation(id: number)` — delete from R2, clear metadata
- New state: `preservationProgress: { current: number, total: number, isRunning: boolean }`

### Step 9: Preservation Badge Component

**New file:** `src/components/BookmarkCard/PreservationBadge.tsx`

Small badge overlaid on BookmarkCard:
- `none` — no badge
- `preserving` — spinner
- `complete` — green archive icon
- `failed` — red warning, click to retry

### Step 10: "Preserve" Action on Bookmark Card

**Modify:** `src/components/BookmarkCard/BookmarkActions.tsx`

Add `LuArchive` icon button:
- Only shown for X/Twitter bookmarks (`metadata.platform === 'x.com'`)
- Tooltip: "Preserve Tweet" / "Already Preserved"
- Calls `preserveBookmark(id)` from store
- Shows spinner during capture+upload
- Uses the card's DOM ref for screenshot capture

### Step 11: Show Screenshot in BookmarkCard

**Modify:** `src/components/BookmarkCard/BookmarkMedia.tsx`

When bookmark has `preservation.status === 'complete'`:
- Show a "Preserved" indicator badge on the media area
- The screenshot is accessible at `preservation.screenshot_url` — can be shown as an alternative view (toggle between live media and screenshot)
- Add small "View Screenshot" button that opens the screenshot in ImageModal

### Step 12: Bulk "Preserve Selected"

**Modify:** `src/components/BulkActionsBar.tsx`

Add `LuArchive` button: "Preserve Selected" — captures and uploads screenshots for all selected X/Twitter bookmarks.

### Step 13: Image Modal Enhancement

**Modify:** `src/components/modals/ImageModal.tsx`

- Show preserved screenshot in modal when available
- Add "Download Screenshot" button (saves PNG locally)
- Show "Preserved on [date]" info

### Step 14: Settings Page — Preservation Section

**Modify:** `src/components/SettingsPage.tsx`

New collapsible "Tweet Preservation" section:
- Total preserved count
- "Preserve All Tweets" button (batch with progress bar)
- "Clear All Preservation Data" button (with confirmation dialog)
- Stats: total preserved, failed, total size
- "Export Preservation Archive" button → ZIP download

### Step 15: Export Preservation Archive

**Modify:** `src/lib/exportFormats.ts`

New `exportPreservationArchive(bookmarks: Bookmark[])` function:
- Uses JSZip (already installed)
- Fetches all screenshots from R2 public URLs
- ZIP contents:
  - `index.html` — browsable gallery with tweet screenshots
  - `screenshots/` — PNG files
  - `metadata.json` — preservation metadata
- Downloads as `bookmarkhub-preservation-{date}.zip`

### Step 16: Conversation Fetching (Chrome Extension)

**Modify:** `chrome-extension/direct-import/content-scripts/twitter-api-client.js`

Add conversation context:
- In `parseTweet()`, extract `in_reply_to_status_id_str` from `legacy`
- New function `fetchTweetById(tweetId)` — fetch single tweet via GraphQL (TweetResultByRestId query)
- New function `fetchConversation(bookmarkTweet)`:
  1. If tweet has `in_reply_to_status_id_str` → fetch parent tweet
  2. Transform parent tweet as regular bookmark
  3. Tag with `"conversation"` tag
- Return conversation bookmarks alongside regular bookmarks

**Modify:** `src/lib/xBookmarkTransform.ts`
- Handle `in_reply_to_status_id` in metadata
- Add conversation tag handling

### Step 17: Sidebar & Navigation

**Modify:** `src/components/UnifiedSidebar.tsx`

Add "Preserved" count badge in sidebar (follow existing shared collections count pattern).

---

## Files Summary

### New Files (5)
| File | Purpose |
|------|---------|
| `src/lib/preservationApi.ts` | R2 API client (upload/delete/get screenshot URL) |
| `src/services/preservation/screenshotService.ts` | html2canvas screenshot capture |
| `src/services/preservation/preservationService.ts` | Orchestration (capture + upload + metadata) |
| `src/services/preservation/index.ts` | Barrel export |
| `src/components/BookmarkCard/PreservationBadge.tsx` | Status badge component |

### Modified Files (11)
| File | Change |
|------|--------|
| `workers/share-api/wrangler.toml` | Add R2 bucket binding |
| `workers/share-api/src/index.ts` | Add /preserve/* endpoints (upload, serve, delete) |
| `src/types/bookmark.ts` | Add PreservationStatus, PreservationData, extend Bookmark |
| `src/store/bookmarkStore.ts` | Add preserve/remove actions, progress state |
| `src/components/BookmarkCard/BookmarkActions.tsx` | Add "Preserve" button |
| `src/components/BookmarkCard/BookmarkMedia.tsx` | Show preserved screenshot indicator |
| `src/components/BulkActionsBar.tsx` | Add "Preserve Selected" button |
| `src/components/SettingsPage.tsx` | Add "Tweet Preservation" section |
| `src/lib/exportFormats.ts` | Add ZIP archive export with R2 screenshots |
| `src/components/modals/ImageModal.tsx` | Support screenshot display + download |
| `src/components/UnifiedSidebar.tsx` | Show preserved count |
| `chrome-extension/.../twitter-api-client.js` | Add conversation/parent tweet fetching |
| `src/lib/xBookmarkTransform.ts` | Handle conversation metadata |

### New Dependency
- `html2canvas` — renders DOM elements to canvas for PNG capture

### Infrastructure
- New Cloudflare R2 bucket: `bookmarkhub-preserve`
- R2 public access enabled (custom domain or public bucket URL)

---

## Verification

1. **Infrastructure:**
   - Create R2 bucket via `npx wrangler r2 bucket create bookmarkhub-preserve`
   - Upload test PNG via Worker API → verify accessible at public URL
   - Deploy updated Worker → verify `/preserve/*` endpoints work

2. **Manual test flow:**
   - Open app with X/Twitter bookmarks
   - Click "Preserve" on a bookmark card → spinner shows → status changes to "complete"
   - View bookmark → "Preserved" badge visible, screenshot accessible
   - Open screenshot in ImageModal → full resolution PNG from R2
   - Open incognito window → navigate to screenshot URL → image loads publicly
   - Go to Settings → see preservation count
   - Click "Export Archive" → ZIP downloads with screenshots
   - Click "Remove Preservation" → DELETE request sent, metadata cleared

3. **Cross-user test:**
   - User A preserves a tweet
   - User A shares the bookmark via shared collection
   - User B views the shared collection → sees the screenshot URL
   - User B opens the screenshot URL → loads from R2

4. **Edge cases:**
   - Bookmark with no media → screenshot captures text-only card (valid)
   - html2canvas fails → status shows "failed", retry available
   - R2 upload fails (network error) → graceful error, retry available
   - Bulk preserve 50+ bookmarks → progress bar, sequential uploads
   - Screenshot > 2MB → rejected by Worker, show size error
