// Script to compare store data vs localStorage data
// Run this in the browser console

console.log('🔍 Comparing store data vs localStorage data...');

// 1. Get data from localStorage
const localStorageData = localStorage.getItem('x-bookmark-manager-bookmarks');
const localBookmarks = localStorageData ? JSON.parse(localStorageData) : [];

console.log('📁 localStorage data:');
console.log(`   Total: ${localBookmarks.length}`);
const localArchived = localBookmarks.filter(b => b.is_archived === true || b.is_archived === 'true');
console.log(`   Archived: ${localArchived.length}`);

if (localArchived.length > 0) {
  console.log('   Archived titles:');
  localArchived.forEach(b => console.log(`     - ${b.title}`));
}

// 2. Try to access store data (this might require different approaches)
console.log('\n🏪 Trying to access store data...');

// Method 1: Check if there's any global store access
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('📱 React DevTools detected');
}

// Method 2: Look for any exposed store methods
const storeKeys = Object.keys(window).filter(key =>
  key.toLowerCase().includes('store') ||
  key.toLowerCase().includes('bookmark') ||
  key.toLowerCase().includes('zustand')
);

console.log('🔍 Potential store keys:', storeKeys);

// Method 3: Create a temporary component to log store data
console.log('\n💡 To check store data:');
console.log('1. Open React DevTools');
console.log('2. Select the CollectionsSidebar component');
console.log('3. Look at the "bookmarks" prop in the console logs above');
console.log('4. Compare the bookmarks array with the localStorage data');

// Method 4: Add a temporary debug function to window
window.debugBookmarkStore = function() {
  console.log('This function should be called from within a React component');
  console.log('Add this to CollectionsSidebar: console.log("Store bookmarks:", bookmarks)');
};

console.log('\n🔧 Added window.debugBookmarkStore() function');
console.log('Call this from the component to debug store data');