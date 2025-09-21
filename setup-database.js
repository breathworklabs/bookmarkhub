import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = 'https://aadrvhwtkcxcvfpldiov.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZHJ2aHd0a2N4Y3ZmcGxkaW92Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM3NTgzNSwiZXhwIjoyMDczOTUxODM1fQ.Fl5M4zH2L5FBiPiDni9tn6apAGOBMXs6DeFSgB1cpqI'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...')

  try {
    // Create a test user
    console.log('👤 Creating test user...')

    const { data: signUpData, error: userError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'testpass123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User'
      }
    })

    if (userError && userError.code !== 'email_exists') {
      console.error('❌ User creation error:', userError)
      return
    }

    // Get the user ID
    let userId
    if (signUpData?.user) {
      userId = signUpData.user.id
      console.log('✅ Test user created:', signUpData.user.email)
    } else {
      // User already exists, get from list
      const { data: users, error: listError } = await supabase.auth.admin.listUsers()
      if (listError) {
        console.error('❌ Error listing users:', listError)
        return
      }
      const testUser = users.users.find(u => u.email === 'test@example.com')
      if (!testUser) {
        console.error('❌ Test user not found')
        return
      }
      userId = testUser.id
      console.log('✅ Using existing test user:', testUser.email)
    }

    console.log(`📝 User ID: ${userId}`)

    // Insert mock bookmark data
    console.log('📚 Inserting mock bookmark data...')

    const mockBookmarks = [
      {
        user_id: userId,
        title: 'React 19 Beta Features - What\'s New',
        url: 'https://react.dev/blog/2024/04/25/react-19',
        description: 'Comprehensive overview of React 19 beta features including Server Components and Actions',
        content: 'React 19 introduces several groundbreaking features that will change how we build React applications...',
        domain: 'react.dev',
        author: 'React Team',
        source_platform: 'manual',
        is_starred: true,
        tags: ['react', 'javascript', 'frontend', 'beta'],
        thumbnail_url: 'https://react.dev/images/blog/react-19-beta/react-19-beta-header.png'
      },
      {
        user_id: userId,
        title: 'TypeScript 5.5 Released',
        url: 'https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/',
        description: 'New features in TypeScript 5.5 including better performance and new language features',
        domain: 'devblogs.microsoft.com',
        author: 'TypeScript Team',
        source_platform: 'manual',
        is_starred: false,
        tags: ['typescript', 'javascript', 'programming'],
        thumbnail_url: 'https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2024/06/5-5-banner.png'
      },
      {
        user_id: userId,
        title: 'Building Scalable Web Apps with Next.js',
        url: 'https://nextjs.org/learn',
        description: 'Learn how to build production-ready web applications with Next.js',
        domain: 'nextjs.org',
        author: 'Vercel',
        source_platform: 'manual',
        is_starred: true,
        tags: ['nextjs', 'react', 'fullstack', 'tutorial'],
        thumbnail_url: 'https://nextjs.org/static/blog/next-13-4/twitter-card.png'
      },
      {
        user_id: userId,
        title: 'Supabase vs Firebase: Database Comparison',
        url: 'https://supabase.com/blog/supabase-vs-firebase',
        description: 'A detailed comparison between Supabase and Firebase for modern web development',
        domain: 'supabase.com',
        author: 'Supabase Team',
        source_platform: 'manual',
        is_starred: false,
        tags: ['supabase', 'firebase', 'database', 'comparison'],
        thumbnail_url: 'https://supabase.com/images/blog/supabase-vs-firebase/og-image.jpg'
      },
      {
        user_id: userId,
        title: 'State Management in React: Zustand vs Redux',
        url: 'https://blog.logrocket.com/zustand-vs-redux/',
        description: 'Comparing modern state management solutions for React applications',
        domain: 'blog.logrocket.com',
        author: 'LogRocket',
        source_platform: 'manual',
        is_starred: true,
        tags: ['react', 'state-management', 'zustand', 'redux'],
        thumbnail_url: 'https://blog.logrocket.com/wp-content/uploads/2023/01/zustand-vs-redux.png'
      },
      {
        user_id: userId,
        title: 'CSS Grid vs Flexbox: When to Use Which',
        url: 'https://css-tricks.com/quick-whats-the-difference-between-flexbox-and-grid/',
        description: 'Understanding the differences between CSS Grid and Flexbox layouts',
        domain: 'css-tricks.com',
        author: 'CSS-Tricks',
        source_platform: 'manual',
        is_starred: false,
        tags: ['css', 'grid', 'flexbox', 'layout'],
        thumbnail_url: 'https://css-tricks.com/wp-content/uploads/2017/06/00-basic-terminology.svg'
      }
    ]

    // Clear existing bookmarks for this user first
    await supabase.from('bookmarks').delete().eq('user_id', userId)

    // Insert new bookmarks
    const { error: insertError } = await supabase
      .from('bookmarks')
      .insert(mockBookmarks)

    if (insertError) {
      console.error('❌ Bookmark insertion error:', insertError)
      return
    }

    console.log('✅ Mock bookmark data inserted successfully')
    console.log(`📊 Total bookmarks: ${mockBookmarks.length}`)

    // Verify data
    const { data: bookmarks, error: fetchError } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)

    if (fetchError) {
      console.error('❌ Error fetching bookmarks:', fetchError)
    } else {
      console.log(`✅ Verified: ${bookmarks.length} bookmarks in database`)
    }

    console.log('\n🎉 Database setup complete!')
    console.log('📧 Test user credentials:')
    console.log('   Email: test@example.com')
    console.log('   Password: testpass123')
    console.log('\n💡 You can now sign in to the app with these credentials to see real data!')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
}

export { setupDatabase }