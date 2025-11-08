// Script to import bookmark data into localStorage
// INSTRUCTIONS: Copy and paste this entire script into your browser's developer console
// while the X Bookmark Manager app is running at http://localhost:5173

const bookmarkData = `7,ae879c80-f3fc-4e05-a837-384e4b9bfb28,React 19 Beta Features - What's New,https://react.dev/blog/2024/04/25/react-19,Comprehensive overview of React 19 beta features including Server Components and Actions,React 19 introduces several groundbreaking features that will change how we build React applications...,https://react.dev/images/blog/react-19-beta/react-19-beta-header.png,,React Team,react.dev,manual,,0,true,false,false,"[""react"",""javascript"",""frontend"",""beta""]",,2025-09-21 02:22:53.277114+00,2025-09-21 02:22:53.277114+00
8,ae879c80-f3fc-4e05-a837-384e4b9bfb28,TypeScript 5.5 Released,https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/,New features in TypeScript 5.5 including better performance and new language features,,https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2024/06/5-5-banner.png,,TypeScript Team,devblogs.microsoft.com,manual,,0,false,false,false,"[""typescript"",""javascript"",""programming""]",,2025-09-21 02:22:53.277114+00,2025-09-21 02:22:53.277114+00
9,ae879c80-f3fc-4e05-a837-384e4b9bfb28,Building Scalable Web Apps with Next.js,https://nextjs.org/learn,Learn how to build production-ready web applications with Next.js,,https://nextjs.org/static/blog/next-13-4/twitter-card.png,,Vercel,nextjs.org,manual,,0,true,false,false,"[""nextjs"",""react"",""fullstack"",""tutorial""]",,2025-09-21 02:22:53.277114+00,2025-09-21 02:22:53.277114+00
10,ae879c80-f3fc-4e05-a837-384e4b9bfb28,Supabase vs Firebase: Database Comparison,https://supabase.com/blog/supabase-vs-firebase,A detailed comparison between Supabase and Firebase for modern web development,,https://supabase.com/images/blog/supabase-vs-firebase/og-image.jpg,,Supabase Team,supabase.com,manual,,0,false,false,false,"[""supabase"",""firebase"",""database"",""comparison""]",,2025-09-21 02:22:53.277114+00,2025-09-21 02:22:53.277114+00
11,ae879c80-f3fc-4e05-a837-384e4b9bfb28,State Management in React: Zustand vs Redux,https://blog.logrocket.com/zustand-vs-redux/,Comparing modern state management solutions for React applications,,https://blog.logrocket.com/wp-content/uploads/2023/01/zustand-vs-redux.png,,LogRocket,blog.logrocket.com,manual,,0,true,false,false,"[""react"",""state-management"",""zustand"",""redux""]",,2025-09-21 02:22:53.277114+00,2025-09-21 02:22:53.277114+00
12,ae879c80-f3fc-4e05-a837-384e4b9bfb28,CSS Grid vs Flexbox: When to Use Which,https://css-tricks.com/quick-whats-the-difference-between-flexbox-and-grid/,Understanding the differences between CSS Grid and Flexbox layouts,,https://css-tricks.com/wp-content/uploads/2017/06/00-basic-terminology.svg,,CSS-Tricks,css-tricks.com,manual,,0,false,false,false,"[""css"",""grid"",""flexbox"",""layout""]",,2025-09-21 02:22:53.277114+00,2025-09-21 02:22:53.277114+00`

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i += 2
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
        i++
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current)
      current = ''
      i++
    } else {
      current += char
      i++
    }
  }

  // Add the last field
  result.push(current)

  return result
}

function parseBookmarks() {
  const lines = bookmarkData.trim().split('\n')
  const bookmarks = []

  for (const line of lines) {
    const fields = parseCSVLine(line)

    const bookmark = {
      id: parseInt(fields[0]),
      user_id: fields[1],
      title: fields[2],
      url: fields[3],
      description: fields[4],
      content: fields[5],
      thumbnail_url: fields[6] || undefined,
      favicon_url: fields[7] || undefined,
      author: fields[8],
      domain: fields[9],
      source_platform: fields[10],
      source_id: fields[11] || undefined,
      engagement_score: parseInt(fields[12]),
      is_starred: fields[13] === 'true',
      is_read: fields[14] === 'true',
      is_archived: fields[15] === 'true',
      tags: JSON.parse(fields[16]),
      metadata: fields[17] || undefined,
      created_at: fields[18],
      updated_at: fields[19],
    }

    bookmarks.push(bookmark)
  }

  return bookmarks
}

function importBookmarks() {
  try {
    const bookmarks = parseBookmarks()

    // Create consolidated storage structure
    const consolidatedData = {
      bookmarks: bookmarks,
      collections: [],
      bookmarkCollections: [],
      settings: {
        theme: 'dark',
        viewMode: 'grid',
        defaultSort: 'newest',
        showMetrics: true,
        compactMode: false,
        autoBackup: false,
        exportFormat: 'json',
        defaultCollection: null,
        duplicateHandling: 'skip',
      },
      metadata: {
        version: '1.0.0',
        totalBookmarks: bookmarks.length,
        createdAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
      },
      version: '2.0.0',
    }

    // Store in consolidated localStorage
    localStorage.setItem(
      'x-bookmark-manager-data',
      JSON.stringify(consolidatedData)
    )

    console.log(
      `✅ Successfully imported ${bookmarks.length} bookmarks into localStorage`
    )
    console.log('📊 Bookmarks:', bookmarks)

    // Refresh the page to load the new data
    console.log('🔄 Refreshing page to load imported bookmarks...')
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    console.error('❌ Failed to import bookmarks:', error)
  }
}

// Check if we're in a browser environment
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  console.log('🌐 Running in browser environment, importing bookmarks...')
  importBookmarks()
} else {
  console.log('💻 Running in Node.js environment. To import bookmarks:')
  console.log('1. Start the dev server: npm run dev')
  console.log('2. Open http://localhost:5173 in your browser')
  console.log('3. Open Developer Tools (F12)')
  console.log('4. Copy and paste this entire script into the Console tab')
  console.log('5. Press Enter to run the import')
}
