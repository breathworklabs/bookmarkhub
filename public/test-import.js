// Test script for X bookmark import functionality
// Run this in browser console to test the import

console.log('🧪 Starting X Bookmark Import Test');

async function testXBookmarkImport() {
  try {
    // Fetch the test data
    console.log('📥 Fetching test data...');
    const response = await fetch('/x-bookmarks-2025-09-22.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Loaded ${data.length} X bookmarks from file`);
    console.log('📋 Sample bookmark:', data[0]);

    // Test the import function
    console.log('🔄 Testing import transformation...');

    // Get the store and import function
    const store = window.__zustand_store__ || useBookmarkStore?.getState?.();
    if (!store) {
      console.error('❌ Store not found. Try: window.useBookmarkStore.getState()');
      return;
    }

    // Test with just 3 bookmarks to start
    console.log('📤 Importing first 3 bookmarks...');
    await store.importXBookmarks(data, 3);

    console.log('✅ Import test completed!');
    console.log('📊 Check bookmarks list for imported items');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Make function available globally
window.testXBookmarkImport = testXBookmarkImport;

console.log('🚀 Test function ready! Run: testXBookmarkImport()');