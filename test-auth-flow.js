import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aadrvhwtkcxcvfpldiov.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZHJ2aHd0a2N4Y3ZmcGxkaW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzU4MzUsImV4cCI6MjA3Mzk1MTgzNX0.xa5WoTSzYO-8I7fvJ5WVlGa2Xp6iWKAS15sf47dlsmA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...')
  console.log('=====================================')

  try {
    // Step 1: Check initial auth state
    console.log('\n1️⃣ Checking initial auth state...')
    const { data: { user: initialUser }, error: initialError } = await supabase.auth.getUser()
    if (initialError && !initialError.message.includes('Auth session missing')) {
      console.error('❌ Initial auth check error:', initialError)
    }
    console.log('👤 Initial user:', initialUser ? `${initialUser.email} (${initialUser.id})` : 'null')

    // Step 2: Sign out if already signed in
    if (initialUser) {
      console.log('\n🚪 Signing out existing user...')
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        console.error('❌ Sign out error:', signOutError)
      } else {
        console.log('✅ Signed out successfully')
      }
    }

    // Step 3: Sign in with test credentials
    console.log('\n2️⃣ Signing in with test credentials...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpass123'
    })

    if (signInError) {
      console.error('❌ Sign in error:', signInError)
      return
    }

    console.log('✅ Sign in successful!')
    console.log('👤 Signed in user:', signInData.user.email, '- ID:', signInData.user.id)

    // Step 4: Verify auth state after sign in
    console.log('\n3️⃣ Verifying auth state after sign in...')
    const { data: { user: verifyUser }, error: verifyError } = await supabase.auth.getUser()
    if (verifyError) {
      console.error('❌ Auth verification error:', verifyError)
      return
    }
    console.log('👤 Verified user:', verifyUser ? `${verifyUser.email} (${verifyUser.id})` : 'null')

    if (!verifyUser) {
      console.error('❌ User not found after sign in!')
      return
    }

    // Step 5: Test bookmark loading
    console.log('\n4️⃣ Testing bookmark loading...')
    const userId = verifyUser.id
    console.log('📚 Loading bookmarks for user:', userId)

    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (bookmarksError) {
      console.error('❌ Bookmark loading error:', bookmarksError)
      return
    }

    console.log('✅ Bookmarks loaded successfully!')
    console.log('📊 Total bookmarks:', bookmarks.length)

    if (bookmarks.length > 0) {
      console.log('\n📝 Sample bookmarks:')
      bookmarks.slice(0, 3).forEach((bookmark, index) => {
        console.log(`   ${index + 1}. ${bookmark.title}`)
        console.log(`      URL: ${bookmark.url}`)
        console.log(`      Tags: ${bookmark.tags ? bookmark.tags.join(', ') : 'none'}`)
        console.log(`      Starred: ${bookmark.is_starred ? '⭐' : '☆'}`)
      })
    }

    // Step 6: Test database service class
    console.log('\n5️⃣ Testing DatabaseService class...')

    // Import the database service
    const { db } = await import('./src/lib/database.js')

    try {
      const serviceBookmarks = await db.getBookmarks(userId)
      console.log('✅ DatabaseService.getBookmarks() successful!')
      console.log('📊 Service returned:', serviceBookmarks.length, 'bookmarks')

      if (serviceBookmarks.length !== bookmarks.length) {
        console.warn('⚠️ Bookmark count mismatch between direct query and service!')
        console.warn(`   Direct query: ${bookmarks.length}`)
        console.warn(`   Service: ${serviceBookmarks.length}`)
      }
    } catch (serviceError) {
      console.error('❌ DatabaseService error:', serviceError)
    }

    console.log('\n🎉 Auth flow test completed successfully!')
    console.log('=====================================')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testAuthFlow()