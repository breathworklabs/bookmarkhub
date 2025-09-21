// Script to check which data source the app is using
// Run this in the browser console

console.log('🔍 Checking data source...');

// 1. Check localStorage directly
const localStorageBookmarks = localStorage.getItem('x-bookmark-manager-bookmarks');
console.log('📁 localStorage bookmarks key exists:', !!localStorageBookmarks);

if (localStorageBookmarks) {
  try {
    const parsed = JSON.parse(localStorageBookmarks);
    console.log('📊 localStorage bookmarks count:', parsed.length);

    // Check if these look like imported bookmarks or mock bookmarks
    if (parsed.length > 0) {
      const firstBookmark = parsed[0];
      console.log('📄 First bookmark:', {
        id: firstBookmark.id,
        title: firstBookmark.title,
        domain: firstBookmark.domain,
        is_archived: firstBookmark.is_archived
      });

      // Mock bookmarks have specific titles, imported ones have different titles
      const mockTitles = [
        'Electric Transportation Future',
        'GPT-4 Turbo Announcement',
        'Next.js 14 Release'
      ];

      const importedTitles = [
        'React 19 Beta Features',
        'TypeScript 5.5 Released',
        'Building Scalable Web Apps'
      ];

      const isMockData = mockTitles.includes(firstBookmark.title);
      const isImportedData = importedTitles.some(title => firstBookmark.title.includes(title.split(' ')[0]));

      console.log('🤖 Is using mock data:', isMockData);
      console.log('📥 Is using imported data:', isImportedData);

      // Count archived in the actual data
      const archived = parsed.filter(b => b.is_archived === true || b.is_archived === 'true');
      console.log('🗄️ Actual archived count in localStorage:', archived.length);

      if (archived.length > 0) {
        console.log('🗄️ Archived bookmarks:');
        archived.forEach(b => console.log(`   - ${b.title}`));
      }
    }
  } catch (e) {
    console.error('❌ Failed to parse localStorage bookmarks:', e);
  }
} else {
  console.log('❌ No bookmarks found in localStorage - app will use mock data');
}

// 2. Check what the app is actually using
console.log('\n🎯 Checking app state...');

// If using React DevTools or if we can access the store
try {
  // This might not work depending on how the store is exposed
  console.log('🏪 Trying to access store state...');

  // Check window object for any exposed store
  const storeKeys = Object.keys(window).filter(key =>
    key.includes('store') || key.includes('zustand') || key.includes('bookmark')
  );
  console.log('🔍 Store-related window keys:', storeKeys);

} catch (e) {
  console.log('⚠️ Cannot access store directly');
}

console.log('\n💡 Instructions:');
console.log('1. If localStorage is empty → run the import script');
console.log('2. If localStorage has data but app shows 6 archived → the app is using mock data');
console.log('3. Check browser console for "using mock data" vs "loaded from localStorage" messages');