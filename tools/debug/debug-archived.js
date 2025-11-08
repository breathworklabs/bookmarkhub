// Debug script to check archived bookmark count
// Run this in the browser console

console.log('🔍 Debugging archived bookmark count...')

// Get bookmarks from localStorage
const bookmarksJson = localStorage.getItem('x-bookmark-manager-bookmarks')
if (!bookmarksJson) {
  console.log('❌ No bookmarks found in localStorage')
} else {
  const bookmarks = JSON.parse(bookmarksJson)
  console.log('📚 Total bookmarks:', bookmarks.length)

  // Check archived status for each bookmark
  const archivedBookmarks = bookmarks.filter((bookmark) => bookmark.is_archived)
  const starredBookmarks = bookmarks.filter((bookmark) => bookmark.is_starred)

  console.log('🗄️ Archived bookmarks:', archivedBookmarks.length)
  console.log('⭐ Starred bookmarks:', starredBookmarks.length)

  // Show first few bookmarks with their archived status
  console.log('\n📋 First 5 bookmarks archived status:')
  bookmarks.slice(0, 5).forEach((bookmark, index) => {
    console.log(
      `${index + 1}. "${bookmark.title}" - is_archived: ${bookmark.is_archived}, is_starred: ${bookmark.is_starred}`
    )
  })

  // Check if there's a data type issue
  console.log('\n🔎 Data type analysis:')
  const firstBookmark = bookmarks[0]
  if (firstBookmark) {
    console.log('is_archived type:', typeof firstBookmark.is_archived)
    console.log('is_archived value:', firstBookmark.is_archived)
    console.log('is_starred type:', typeof firstBookmark.is_starred)
    console.log('is_starred value:', firstBookmark.is_starred)
  }
}
