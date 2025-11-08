// Debug script to check what's actually in localStorage
// Run this in the browser console to see the real data

console.log('🔍 Debugging localStorage contents...')

// Get all bookmark-related localStorage items
const keys = Object.keys(localStorage).filter((key) => key.includes('bookmark'))
console.log('📚 All bookmark-related localStorage keys:', keys)

keys.forEach((key) => {
  const value = localStorage.getItem(key)
  console.log(`\n🔑 Key: ${key}`)
  console.log(`📊 Value length: ${value ? value.length : 'null'}`)

  if (value && key.includes('bookmarks') && !key.includes('collections')) {
    try {
      const parsed = JSON.parse(value)
      console.log(`📋 Number of bookmarks: ${parsed.length}`)

      // Check archived status of each bookmark
      const archivedBookmarks = parsed.filter((bookmark) => {
        console.log(
          `📄 "${bookmark.title || 'No title'}" - is_archived: ${bookmark.is_archived} (type: ${typeof bookmark.is_archived})`
        )
        return bookmark.is_archived === true || bookmark.is_archived === 'true'
      })

      console.log(`🗄️ Total archived count: ${archivedBookmarks.length}`)

      if (archivedBookmarks.length > 0) {
        console.log('🗄️ Archived bookmarks:')
        archivedBookmarks.forEach((bookmark, index) => {
          console.log(
            `  ${index + 1}. "${bookmark.title}" - is_archived: ${bookmark.is_archived}`
          )
        })
      }

      // Check for any data inconsistencies
      const booleanTypes = parsed.filter(
        (b) => typeof b.is_archived === 'boolean'
      )
      const stringTypes = parsed.filter(
        (b) => typeof b.is_archived === 'string'
      )
      const otherTypes = parsed.filter(
        (b) =>
          typeof b.is_archived !== 'boolean' &&
          typeof b.is_archived !== 'string'
      )

      console.log(`📊 Type analysis:`)
      console.log(`  - Boolean is_archived: ${booleanTypes.length}`)
      console.log(`  - String is_archived: ${stringTypes.length}`)
      console.log(`  - Other types: ${otherTypes.length}`)
    } catch (e) {
      console.error('❌ Failed to parse JSON:', e)
    }
  }
})

// Also check if there are any other data sources
console.log('\n🔍 Checking for other potential data sources...')

// Check if there's any Zustand persist data
const zustandKeys = Object.keys(localStorage).filter(
  (key) =>
    key.includes('zustand') || key.includes('store') || key.includes('persist')
)
console.log('🏪 Zustand/store keys:', zustandKeys)

// Check session storage too
console.log('\n🔍 Checking sessionStorage...')
const sessionKeys = Object.keys(sessionStorage)
console.log('💾 SessionStorage keys:', sessionKeys)
