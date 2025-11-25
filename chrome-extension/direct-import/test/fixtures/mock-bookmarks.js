/**
 * Mock data for BookmarkHub Extension E2E tests
 */

/**
 * Generate a mock raw tweet (as returned by Twitter API)
 */
function generateMockRawTweet(index) {
  const usernames = ['elonmusk', 'naval', 'pmarca', 'sama', 'paulg']
  const displayNames = ['Elon Musk', 'Naval', 'Marc Andreessen', 'Sam Altman', 'Paul Graham']
  const texts = [
    'This is a test tweet about AI and the future #AI #tech',
    'Building in public is the best way to learn #buildinpublic',
    'Just shipped a new feature! https://example.com/feature',
    'Thread: How to grow your startup',
    'Hot take: Most advice is terrible',
  ]

  const username = usernames[index % usernames.length]
  const displayName = displayNames[index % displayNames.length]
  const text = texts[index % texts.length]
  const tweetId = `${1800000000000000000 + index}`
  const timestamp = new Date(Date.now() - index * 3600000).toISOString()

  return {
    id: tweetId,
    text: text,
    created_at: timestamp,
    user: {
      id: `${100000000 + index}`,
      screen_name: username,
      name: displayName,
      profile_image_url: `https://pbs.twimg.com/profile_images/${username}_400x400.jpg`,
      verified: index % 2 === 0,
      followers_count: 1000000 + index * 10000,
      description: `Bio for ${displayName}`,
    },
    favorite_count: 1000 + index * 100,
    retweet_count: 500 + index * 50,
    reply_count: 100 + index * 10,
    quote_count: 50 + index * 5,
    bookmark_count: 200 + index * 20,
    view_count: 100000 + index * 1000,
    entities: {
      hashtags: text.match(/#\w+/g)?.map((tag, i) => ({
        text: tag.slice(1),
        indices: [text.indexOf(tag), text.indexOf(tag) + tag.length],
      })) || [],
      urls: text.match(/https?:\/\/\S+/g)?.map((url, i) => ({
        url: url,
        expanded_url: url,
        display_url: url.replace('https://', ''),
        indices: [text.indexOf(url), text.indexOf(url) + url.length],
      })) || [],
      user_mentions: [],
      media: index % 3 === 0 ? [{
        type: 'photo',
        media_url_https: `https://pbs.twimg.com/media/test_image_${index}.jpg`,
        indices: [0, 23],
      }] : [],
    },
    extended_entities: index % 3 === 0 ? {
      media: [{
        type: 'photo',
        media_url_https: `https://pbs.twimg.com/media/test_image_${index}.jpg`,
      }],
    } : undefined,
  }
}

/**
 * Generate a mock transformed bookmark (as stored in extension/localStorage)
 */
function generateMockBookmark(index) {
  const raw = generateMockRawTweet(index)
  const tweetUrl = `https://x.com/${raw.user.screen_name}/status/${raw.id}`

  // Clean text (remove URLs)
  let cleanText = raw.text
  if (raw.entities?.urls) {
    raw.entities.urls.forEach((url) => {
      cleanText = cleanText.replace(url.url, '')
    })
  }
  cleanText = cleanText.trim()

  return {
    id: Date.now() + index,
    user_id: 'chrome-extension',
    title: cleanText.substring(0, 100) || `Tweet by ${raw.user.name}`,
    url: tweetUrl,
    description: cleanText.substring(0, 200),
    content: raw.text,
    thumbnail_url: raw.extended_entities?.media?.[0]?.media_url_https || null,
    favicon_url: raw.user.profile_image_url,
    author: `${raw.user.name} (@${raw.user.screen_name})`,
    domain: 'x.com',
    source_platform: 'twitter',
    source_id: raw.id,
    engagement_score: raw.favorite_count + raw.retweet_count * 2 + raw.reply_count,
    is_starred: false,
    is_read: false,
    is_archived: false,
    is_shared: false,
    is_deleted: false,
    tags: raw.entities.hashtags?.map((h) => h.text.toLowerCase()) || [],
    collections: ['Imported from X'],
    metadata: {
      platform: 'x.com',
      tweet_date: raw.created_at,
      extracted_at: new Date().toISOString(),
      username: raw.user.screen_name,
      display_name: raw.user.name,
      has_video: false,
      images: raw.extended_entities?.media?.map((m) => m.media_url_https) || [],
      user: {
        id: raw.user.id,
        name: raw.user.name,
        screen_name: raw.user.screen_name,
        profile_image_url: raw.user.profile_image_url,
        verified: raw.user.verified,
        followers_count: raw.user.followers_count,
        description: raw.user.description,
      },
      engagement: {
        likes: raw.favorite_count,
        retweets: raw.retweet_count,
        replies: raw.reply_count,
        quotes: raw.quote_count,
        bookmarks: raw.bookmark_count,
        views: raw.view_count,
      },
      import_date: new Date().toISOString(),
      import_source: 'chrome-extension-api',
      plain_text: raw.text,
      has_media: (raw.extended_entities?.media?.length || 0) > 0,
      media_count: raw.extended_entities?.media?.length || 0,
    },
    created_at: raw.created_at,
    updated_at: new Date().toISOString(),
  }
}

/**
 * Generate multiple mock bookmarks
 */
function generateMockBookmarks(count) {
  return Array.from({ length: count }, (_, i) => generateMockBookmark(i))
}

/**
 * Generate multiple mock raw tweets
 */
function generateMockRawTweets(count) {
  return Array.from({ length: count }, (_, i) => generateMockRawTweet(i))
}

/**
 * Mock localStorage data structure
 */
function generateMockLocalStorageData(bookmarks = []) {
  return {
    bookmarks: bookmarks,
    collections: [
      {
        id: 'uncategorized',
        name: 'Uncategorized',
        isPrivate: false,
        isDefault: true,
        isSmartCollection: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bookmarkCount: bookmarks.length,
        userId: 'local-user',
      },
    ],
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
    extensionSettings: {
      extension: {
        importDuplicates: 'skip',
        defaultTags: [],
        syncNotifications: true,
      },
    },
    metadata: {
      version: '2.0.0',
      totalBookmarks: bookmarks.length,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
    },
    version: '2.0.0',
  }
}

module.exports = {
  generateMockRawTweet,
  generateMockBookmark,
  generateMockBookmarks,
  generateMockRawTweets,
  generateMockLocalStorageData,
}
