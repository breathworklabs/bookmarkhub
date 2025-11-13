/**
 * Test Mode for BookmarkHub Extension
 *
 * Simulates Twitter bookmark extraction without needing real Twitter data
 * Run this in console on any page to test the extraction logic
 */

// Enable test mode
window.BOOKMARKX_TEST_MODE = true

// Generate fake tweet data
function generateFakeTweet(index) {
  const usernames = [
    'elonmusk',
    'naval',
    'pmarca',
    'sama',
    'paulg',
    'levie',
    'dhh',
    'patio11',
    'swyx',
    'agazdecki',
  ]
  const displayNames = [
    'Elon Musk',
    'Naval',
    'Marc Andreessen',
    'Sam Altman',
    'Paul Graham',
    'Aaron Levie',
    'DHH',
    'Patrick McKenzie',
    'Shawn Wang',
    'Andrew Gazdecki',
  ]
  const texts = [
    'This is a test tweet about AI and the future',
    'Building in public is the best way to learn',
    'Just shipped a new feature!',
    'Thread: How to grow your startup 🧵',
    'Hot take: Most advice is terrible',
    'Remember: Focus on what matters',
    'Ship fast, iterate faster',
    'The future is already here',
    'Success is about persistence',
    'Always be learning',
  ]

  const username = usernames[index % usernames.length]
  const displayName = displayNames[index % displayNames.length]
  const text = texts[index % texts.length]
  const tweetId = `${1234567890 + index}`
  const timestamp = new Date(Date.now() - index * 3600000).toISOString()

  return {
    id: tweetId,
    username: username,
    displayName: displayName,
    text: text,
    url: `https://twitter.com/${username}/status/${tweetId}`,
    timestamp: timestamp,
    images: index % 3 === 0 ? ['https://pbs.twimg.com/media/test.jpg'] : [],
    profileImage: `https://pbs.twimg.com/profile_images/${username}.jpg`,
    extractedAt: new Date().toISOString(),
  }
}

// Create fake DOM elements that look like Twitter tweets
function createFakeTweetElements(count) {
  console.log(`[TEST] Creating ${count} fake tweet elements`)

  // Remove any existing fake tweets
  document.querySelectorAll('.test-tweet').forEach((el) => el.remove())

  const container = document.createElement('div')
  container.id = 'test-timeline'
  container.style.cssText =
    'position: fixed; top: 0; left: 0; width: 100%; height: 100%; overflow-y: auto; background: white; z-index: 999999; padding: 20px;'

  for (let i = 0; i < count; i++) {
    const tweet = generateFakeTweet(i)

    const article = document.createElement('article')
    article.className = 'test-tweet'
    article.setAttribute('data-testid', 'tweet')
    article.style.cssText =
      'border: 1px solid #ccc; padding: 20px; margin-bottom: 10px; border-radius: 8px;'

    article.innerHTML = `
      <div data-testid="User-Name">
        <a role="link" href="/${tweet.username}">
          <span><span>${tweet.displayName}</span></span>
        </a>
      </div>
      <div data-testid="tweetText">${tweet.text}</div>
      <a href="/${tweet.username}/status/${tweet.id}">Link</a>
      <time datetime="${tweet.timestamp}"></time>
      <img src="${tweet.profileImage}" style="display:none">
    `

    container.appendChild(article)
  }

  document.body.appendChild(container)
  console.log(`[TEST] Created ${count} fake tweets in DOM`)
}

// Test extraction function
function testExtraction(count = 50) {
  console.log(`\n=== BOOKMARKX TEST MODE ===`)
  console.log(`Testing extraction with ${count} fake bookmarks\n`)

  // Create fake tweets
  createFakeTweetElements(count)

  // Wait a bit, then run extraction
  setTimeout(() => {
    console.log('[TEST] Running extraction...')

    const tweets = document.querySelectorAll('article[data-testid="tweet"]')
    console.log(`[TEST] Found ${tweets.length} tweet elements`)

    const extracted = []
    tweets.forEach((tweet, index) => {
      try {
        // Simulate extraction
        const usernameEl = tweet.querySelector(
          '[data-testid="User-Name"] a[role="link"]'
        )
        const username = usernameEl
          ? usernameEl.getAttribute('href').replace('/', '')
          : ''

        const displayNameEl = tweet.querySelector(
          '[data-testid="User-Name"] span > span'
        )
        const displayName = displayNameEl ? displayNameEl.textContent : ''

        const textEl = tweet.querySelector('[data-testid="tweetText"]')
        const text = textEl ? textEl.textContent : ''

        const linkEl = tweet.querySelector('a[href*="/status/"]')
        const url = linkEl
          ? 'https://twitter.com' + linkEl.getAttribute('href')
          : ''

        const tweetId = url.match(/\/status\/(\d+)/)?.[1] || ''

        const timeEl = tweet.querySelector('time')
        const timestamp = timeEl
          ? timeEl.getAttribute('datetime')
          : new Date().toISOString()

        if (tweetId && username) {
          extracted.push({
            id: tweetId,
            username,
            displayName,
            text,
            url,
            timestamp,
            images: [],
            profileImage: '',
            extractedAt: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error(`[TEST] Error extracting tweet ${index}:`, error)
      }
    })

    console.log(`\n=== TEST RESULTS ===`)
    console.log(`✅ Extracted: ${extracted.length}/${count} bookmarks`)
    console.log(
      `Success rate: ${((extracted.length / count) * 100).toFixed(1)}%`
    )

    if (extracted.length > 0) {
      console.log(`\nSample bookmark:`, extracted[0])
    }

    if (extracted.length !== count) {
      console.error(`❌ FAILED: Expected ${count}, got ${extracted.length}`)
    } else {
      console.log(`\n✅ ALL TESTS PASSED!`)
    }

    // Test storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set(
        {
          extractedBookmarks: extracted,
          extractedAt: new Date().toISOString(),
        },
        () => {
          console.log(`✅ Saved ${extracted.length} bookmarks to storage`)
        }
      )
    }

    return extracted
  }, 1000)
}

// Test scroll functionality
function testScroll() {
  console.log(`\n=== TESTING SCROLL ===`)

  const container = document.getElementById('test-timeline')
  if (!container) {
    console.error('❌ No test timeline found. Run testExtraction() first')
    return
  }

  let scrollCount = 0
  const maxScrolls = 5

  function doScroll() {
    const before = container.scrollTop
    const beforeCount = document.querySelectorAll(
      'article[data-testid="tweet"]'
    ).length

    console.log(`\n[SCROLL ${scrollCount + 1}/${maxScrolls}]`)
    console.log(`Tweets before: ${beforeCount}`)
    console.log(`Scroll position: ${before}`)

    // Scroll
    container.scrollBy({ top: 500, behavior: 'smooth' })

    setTimeout(() => {
      const after = container.scrollTop
      const afterCount = document.querySelectorAll(
        'article[data-testid="tweet"]'
      ).length

      console.log(
        `Tweets after: ${afterCount} (gained ${afterCount - beforeCount})`
      )
      console.log(`Scroll position: ${after} (moved ${after - before}px)`)

      scrollCount++

      if (scrollCount < maxScrolls && after > before) {
        setTimeout(doScroll, 1000)
      } else {
        console.log(`\n✅ SCROLL TEST COMPLETE`)
        console.log(`Total scrolls: ${scrollCount}`)
        console.log(`Final tweet count: ${afterCount}`)
      }
    }, 500)
  }

  doScroll()
}

// Cleanup
function cleanup() {
  const container = document.getElementById('test-timeline')
  if (container) {
    container.remove()
    console.log('✅ Cleaned up test elements')
  }
}

// Auto-run basic test
console.log(`
╔════════════════════════════════════════╗
║   BookmarkHub Extension Test Mode       ║
╚════════════════════════════════════════╝

Available commands:
  testExtraction(50)  - Test extraction with 50 fake bookmarks
  testScroll()        - Test scroll functionality
  cleanup()           - Remove test elements

Running basic test in 2 seconds...
`)

setTimeout(() => {
  testExtraction(50)
}, 2000)
