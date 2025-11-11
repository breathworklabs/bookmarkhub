# Twitter Archive Import Feature

This feature allows users to import their bookmarks from a Twitter data archive ZIP file.

## Overview

Twitter provides users with the ability to download their complete data archive, which includes their bookmarked tweets in a specific format. This feature extracts and imports those bookmarks into BookmarkX.

## How to Use

1. **Get Your Twitter Archive**
   - Go to Twitter Settings > Your Account > Download an archive of your data
   - Wait for Twitter to prepare your archive (can take up to 24 hours)
   - Download the ZIP file when ready

2. **Import to BookmarkX**
   - Click the "Import" button in BookmarkX
   - Select your Twitter archive ZIP file (typically named `twitter-YYYY-MM-DD-xxxxx.zip`)
   - Wait for the import to complete
   - Your bookmarks will be imported with the tag "Twitter Archive"

## Technical Details

### Supported Formats

- **ZIP Files**: Twitter data archive in `.zip` format
- **JSON Files**: Direct X bookmarks export (legacy format)

### Archive Structure

Twitter archives contain a file at `data/bookmarks.js` (or `data/bookmark.js`) with the format:

```javascript
window.YTD.bookmarks.part0 = [
  {
    bookmark: {
      tweetId: "...",
      fullText: "...",
      createdAt: "...",
      user: { ... },
      entities: { ... }
    }
  }
]
```

### Import Process

1. **ZIP Extraction**: Extract `bookmarks.js` from the archive
2. **Parsing**: Parse the JavaScript format and extract bookmark data
3. **Transformation**: Convert to BookmarkX format with metadata
4. **Validation**: Sanitize and validate each bookmark
5. **Storage**: Save to local storage

### Data Mapping

| Twitter Archive Field            | BookmarkX Field                    |
| -------------------------------- | ---------------------------------- |
| `tweetId`                        | `source_id`                        |
| `fullText`                       | `title`, `description`, `content`  |
| `user.name` + `user.screen_name` | `author`                           |
| `entities.urls`                  | `url`                              |
| `entities.media`                 | `thumbnail_url`, `metadata.images` |
| `user.profile_image_url_https`   | `favicon_url`                      |

### Metadata Preservation

Imported bookmarks include additional metadata:

```json
{
  "tweet_id": "original tweet ID",
  "tweet_date": "original tweet timestamp",
  "username": "author username",
  "display_name": "author display name",
  "imported_from": "twitter_archive",
  "imported_at": "import timestamp",
  "has_video": true/false,
  "images": ["image URLs"],
  "profile_image": "author profile image URL"
}
```

## Implementation

### Service Layer

Located in `src/services/twitterArchiveImport/`:

- **types.ts**: TypeScript types and interfaces
- **zipProcessor.ts**: ZIP file extraction using JSZip
- **archiveParser.ts**: Parse Twitter's JavaScript format
- **dataTransformer.ts**: Transform to BookmarkX format
- **index.ts**: Main service export

### React Hook

`src/hooks/useArchiveImport.ts` provides:

- `importArchive(file)`: Import function
- `isImporting`: Import state
- `progress`: Progress tracking
- `result`: Import result
- `error`: Error messages
- `reset()`: Reset state

### Integration

The import button in `SearchHeader.tsx` handles both:

- `.zip` files → Twitter Archive import
- `.json` files → X bookmarks or regular export

## Error Handling

The service provides detailed error messages for:

- Invalid file format
- File too large (>100MB)
- Missing bookmarks.js in archive
- Empty archive
- Invalid bookmark data
- Parsing errors

## Testing

Unit tests in `tests/unittests/twitterArchiveImport.test.ts` cover:

- Archive parsing
- Multiple bookmarks
- Media handling (images/video)
- Empty content handling
- Data transformation
- Error cases

## Performance

- Processes bookmarks in batches
- Progress tracking for large imports
- Sanitization and validation per bookmark
- Engagement score calculation

## Future Enhancements

- [ ] Import progress modal with visual feedback
- [ ] Duplicate detection during import
- [ ] Option to merge or replace existing bookmarks
- [ ] Import statistics and summary
- [ ] Support for partial imports (filter by date, author, etc.)
- [ ] Background import for large archives
