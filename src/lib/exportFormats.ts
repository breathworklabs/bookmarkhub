/**
 * Export bookmarks to different formats
 */

import type { Bookmark } from '../types/bookmark'

/**
 * Export bookmarks as CSV
 */
export const exportAsCSV = (bookmarks: Bookmark[]): string => {
  // CSV Headers
  const headers = [
    'ID',
    'Title',
    'URL',
    'Author',
    'Domain',
    'Description',
    'Tags',
    'Collections',
    'Is Starred',
    'Is Read',
    'Is Archived',
    'Created At',
    'Source Platform',
    'Engagement Score',
  ]

  // Escape CSV field
  const escapeCSV = (field: any): string => {
    if (field === null || field === undefined) return ''
    const str = String(field)
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  // Build CSV rows
  const rows = bookmarks.map((bookmark) => [
    bookmark.id,
    escapeCSV(bookmark.title),
    escapeCSV(bookmark.url),
    escapeCSV(bookmark.author || ''),
    escapeCSV(bookmark.domain),
    escapeCSV(bookmark.description || ''),
    escapeCSV(bookmark.tags.join('; ')),
    escapeCSV(bookmark.collections?.join('; ') || ''),
    bookmark.is_starred ? 'Yes' : 'No',
    bookmark.is_read ? 'Yes' : 'No',
    bookmark.is_archived ? 'Yes' : 'No',
    escapeCSV(bookmark.created_at),
    escapeCSV(bookmark.source_platform || 'manual'),
    bookmark.engagement_score || 0,
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  return csvContent
}

/**
 * Export bookmarks as HTML
 */
export const exportAsHTML = (bookmarks: Bookmark[]): string => {
  const escapeHTML = (str: string): string => {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString()
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>X Bookmarks Export - ${new Date().toLocaleDateString()}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    header {
      background: linear-gradient(135deg, #1DA1F2, #8B5CF6);
      color: white;
      padding: 30px;
      text-align: center;
    }
    h1 {
      font-size: 2em;
      margin-bottom: 10px;
    }
    .stats {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 20px;
      font-size: 0.9em;
    }
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .stat-value {
      font-size: 1.5em;
      font-weight: bold;
    }
    .bookmarks {
      padding: 30px;
    }
    .bookmark {
      border-left: 3px solid #1DA1F2;
      padding: 20px;
      margin-bottom: 20px;
      background: #fafafa;
      border-radius: 4px;
      transition: all 0.2s;
    }
    .bookmark:hover {
      background: #f0f0f0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .bookmark.starred {
      border-left-color: #FFD700;
      background: #fffef0;
    }
    .bookmark-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 10px;
    }
    .bookmark-title {
      font-size: 1.2em;
      font-weight: 600;
      color: #1DA1F2;
      text-decoration: none;
      margin-bottom: 5px;
      display: block;
    }
    .bookmark-title:hover {
      text-decoration: underline;
    }
    .bookmark-url {
      font-size: 0.85em;
      color: #666;
      word-break: break-all;
    }
    .bookmark-meta {
      display: flex;
      gap: 15px;
      margin: 10px 0;
      font-size: 0.85em;
      color: #666;
    }
    .bookmark-description {
      margin: 10px 0;
      color: #555;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 10px;
    }
    .tag {
      background: #e1f5ff;
      color: #0288d1;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: 500;
    }
    .badges {
      display: flex;
      gap: 5px;
    }
    .badge {
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.75em;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge.starred {
      background: #FFD700;
      color: #333;
    }
    .badge.read {
      background: #4CAF50;
      color: white;
    }
    .badge.archived {
      background: #9E9E9E;
      color: white;
    }
    footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 0.9em;
      border-top: 1px solid #eee;
    }
    @media print {
      body {
        background: white;
      }
      .container {
        box-shadow: none;
      }
      .bookmark:hover {
        background: #fafafa;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📚 X Bookmarks Export</h1>
      <p>Exported on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      <div class="stats">
        <div class="stat">
          <span class="stat-value">${bookmarks.length}</span>
          <span>Total Bookmarks</span>
        </div>
        <div class="stat">
          <span class="stat-value">${bookmarks.filter((b) => b.is_starred).length}</span>
          <span>Starred</span>
        </div>
        <div class="stat">
          <span class="stat-value">${bookmarks.filter((b) => b.is_read).length}</span>
          <span>Read</span>
        </div>
      </div>
    </header>

    <div class="bookmarks">
      ${bookmarks
        .map(
          (bookmark) => `
      <div class="bookmark ${bookmark.is_starred ? 'starred' : ''}">
        <div class="bookmark-header">
          <div>
            <a href="${escapeHTML(bookmark.url)}" target="_blank" class="bookmark-title">
              ${escapeHTML(bookmark.title)}
            </a>
            <div class="bookmark-url">${escapeHTML(bookmark.url)}</div>
          </div>
          <div class="badges">
            ${bookmark.is_starred ? '<span class="badge starred">★ Starred</span>' : ''}
            ${bookmark.is_read ? '<span class="badge read">Read</span>' : ''}
            ${bookmark.is_archived ? '<span class="badge archived">Archived</span>' : ''}
          </div>
        </div>

        <div class="bookmark-meta">
          ${bookmark.author ? `<span>👤 ${escapeHTML(bookmark.author)}</span>` : ''}
          ${bookmark.domain ? `<span>🌐 ${escapeHTML(bookmark.domain)}</span>` : ''}
          <span>📅 ${formatDate(bookmark.created_at)}</span>
          ${bookmark.source_platform ? `<span>📱 ${escapeHTML(bookmark.source_platform)}</span>` : ''}
        </div>

        ${
          bookmark.description
            ? `
        <div class="bookmark-description">
          ${escapeHTML(bookmark.description)}
        </div>
        `
            : ''
        }

        ${
          bookmark.tags.length > 0
            ? `
        <div class="tags">
          ${bookmark.tags.map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}
        </div>
        `
            : ''
        }
      </div>
      `
        )
        .join('')}
    </div>

    <footer>
      <p>Generated by X Bookmark Manager</p>
      <p>This file contains ${bookmarks.length} bookmarks</p>
    </footer>
  </div>
</body>
</html>`

  return html
}

/**
 * Download file with given content and filename
 */
export const downloadFile = (
  content: string,
  filename: string,
  mimeType: string
) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
