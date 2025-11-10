/**
 * Twitter Bookmarks API Client
 * Uses Twitter's GraphQL endpoint to fetch bookmarks fast
 * NO SCROLLING NEEDED!
 */

;(function () {
  'use strict'

  if (!window.location.pathname.includes('/bookmarks')) {
    return
  }

  let allBookmarks = []
  let isCollecting = false

  // Show start banner or import button
  setTimeout(() => {
    checkExistingBookmarks()
  }, 2000)

  function checkExistingBookmarks() {
    chrome.storage.local.get(['extractedBookmarks'], (result) => {
      if (result.extractedBookmarks && result.extractedBookmarks.length > 0) {
        showImportBanner(result.extractedBookmarks.length)
      } else {
        showStartBanner()
      }
    })
  }

  function showImportBanner(count) {
    const banner = document.createElement('div')
    banner.id = 'bookmarkx-import-banner'
    banner.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 20px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      width: 400px;
      box-sizing: border-box;
    `

    banner.innerHTML = `
      <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">
        ✓ ${count} Bookmarks Ready
      </h3>
      <p style="margin: 0 0 12px 0; font-size: 14px; opacity: 0.9;">
        Your bookmarks are ready to import into BookmarkX!
      </p>
      <button id="bookmarkx-import-btn" style="
        background: white;
        color: #059669;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
        width: 100%;
        margin-bottom: 8px;
      ">
        Import into BookmarkX
      </button>
      <button id="bookmarkx-refetch-btn" style="
        background: transparent;
        color: white;
        border: 1px solid rgba(255,255,255,0.5);
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        font-size: 12px;
        width: 100%;
      ">
        Fetch Again
      </button>
    `

    document.body.appendChild(banner)

    document
      .getElementById('bookmarkx-import-btn')
      .addEventListener('click', () => {
        banner.remove()
        chrome.runtime.sendMessage({ type: 'OPEN_BOOKMARKX' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              '[BookmarkX API] Error opening BookmarkX:',
              chrome.runtime.lastError.message
            )
            showError(
              'Failed to open BookmarkX. Is the extension installed correctly?'
            )
          }
        })
      })

    document
      .getElementById('bookmarkx-refetch-btn')
      .addEventListener('click', () => {
        banner.remove()
        showStartBanner()
      })
  }

  function showStartBanner() {
    // Check if banner already exists
    const existingBanner = document.getElementById('bookmarkx-start-banner')
    if (existingBanner) {
      existingBanner.remove()
    }

    const banner = document.createElement('div')
    banner.id = 'bookmarkx-start-banner'
    banner.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      width: 400px;
      box-sizing: border-box;
    `

    banner.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <img src="${chrome.runtime.getURL('assets/icon-48.png')}" alt="BookmarkX" style="width: 32px; height: 32px; margin-right: 12px;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600;">
          Import Your Bookmarks
        </h3>
      </div>
      <p style="margin: 0 0 16px 0; font-size: 14px; opacity: 0.9;">
        Import all your X/Twitter bookmarks to BookmarkX in seconds. No scrolling needed!
      </p>
      <button id="bookmarkx-fetch-btn" style="
        background: white;
        color: #667eea;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
        width: 100%;
      ">
        Start Import
      </button>
    `

    document.body.appendChild(banner)

    const btn = document.getElementById('bookmarkx-fetch-btn')
    if (btn) {
      btn.addEventListener('click', () => {
        banner.remove()
        startFetching()
      })
    }
  }

  async function startFetching() {
    if (isCollecting) {
      return
    }
    isCollecting = true

    try {
      showProgressBanner()
      await fetchAllBookmarks()
    } catch (error) {
      console.error('[BookmarkX API] Error:', error)
      showError(error.message)
      isCollecting = false
    }
  }

  function showProgressBanner() {
    const banner = document.createElement('div')
    banner.id = 'bookmarkx-progress-banner'
    banner.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      width: 400px;
      box-sizing: border-box;
    `

    banner.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <img src="${chrome.runtime.getURL('assets/icon-48.png')}" alt="BookmarkX" style="width: 32px; height: 32px; margin-right: 12px;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600;">
          Fetching Bookmarks...
        </h3>
      </div>
      <p id="bookmarkx-count" style="margin: 0 0 4px 0; font-size: 14px; opacity: 0.9;">
        Found 0 bookmarks
      </p>
      <p id="bookmarkx-status" style="margin: 0; font-size: 12px; opacity: 0.7;">
        Making API requests...
      </p>
      <div style="margin-top: 12px; background: rgba(255,255,255,0.3); height: 6px; border-radius: 3px; overflow: hidden;">
        <div id="bookmarkx-progress-bar" style="height: 100%; background: white; width: 0%; transition: width 0.3s;"></div>
      </div>
    `

    document.body.appendChild(banner)
  }

  function updateProgress(count, status) {
    const countEl = document.getElementById('bookmarkx-count')
    const statusEl = document.getElementById('bookmarkx-status')

    if (countEl) countEl.textContent = `Found ${count} bookmarks`
    if (statusEl) statusEl.textContent = status
  }

  async function fetchAllBookmarks() {
    let cursor = null
    let hasMore = true
    let requestCount = 0

    while (hasMore) {
      requestCount++
      updateProgress(allBookmarks.length, `Request ${requestCount}...`)

      try {
        const result = await fetchBookmarksPage(cursor)

        if (result.bookmarks.length === 0) {
          hasMore = false
          break
        }

        allBookmarks.push(...result.bookmarks)
        cursor = result.nextCursor
        hasMore = result.hasMore

        // Small delay between requests (be nice to Twitter's API)
        await new Promise((resolve) => setTimeout(resolve, 300))
      } catch (error) {
        console.error('[BookmarkX API] Fetch error:', error)
        throw error
      }
    }

    finishCollection()
  }

  async function fetchBookmarksPage(cursor) {
    // Extract auth token and query ID from page
    const { authToken, queryId } = await getTwitterCredentials()

    const variables = {
      count: 100, // Fetch 100 at a time
      includePromotedContent: false,
    }

    if (cursor) {
      variables.cursor = cursor
    }

    const features = {
      rweb_video_screen_enabled: false,
      payments_enabled: false,
      profile_label_improvements_pcf_label_in_post_enabled: true,
      responsive_web_profile_redirect_enabled: false,
      rweb_tipjar_consumption_enabled: true,
      verified_phone_label_enabled: false,
      creator_subscriptions_tweet_preview_api_enabled: true,
      responsive_web_graphql_timeline_navigation_enabled: true,
      responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
      premium_content_api_read_enabled: false,
      communities_web_enable_tweet_community_results_fetch: true,
      c9s_tweet_anatomy_moderator_badge_enabled: true,
      responsive_web_grok_analyze_button_fetch_trends_enabled: false,
      responsive_web_grok_analyze_post_followups_enabled: true,
      responsive_web_jetfuel_frame: true,
      responsive_web_grok_share_attachment_enabled: true,
      articles_preview_enabled: true,
      responsive_web_edit_tweet_api_enabled: true,
      graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
      view_counts_everywhere_api_enabled: true,
      longform_notetweets_consumption_enabled: true,
      responsive_web_twitter_article_tweet_consumption_enabled: true,
      tweet_awards_web_tipping_enabled: false,
      responsive_web_grok_show_grok_translated_post: false,
      responsive_web_grok_analysis_button_from_backend: true,
      creator_subscriptions_quote_tweet_preview_enabled: false,
      freedom_of_speech_not_reach_fetch_enabled: true,
      standardized_nudges_misinfo: true,
      tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
      longform_notetweets_rich_text_read_enabled: true,
      longform_notetweets_inline_media_enabled: true,
      responsive_web_grok_image_annotation_enabled: true,
      responsive_web_grok_imagine_annotation_enabled: true,
      responsive_web_grok_community_note_auto_translation_is_enabled: false,
      responsive_web_enhance_cards_enabled: false,
    }

    const url =
      `https://x.com/i/api/graphql/${queryId}/Bookmarks?` +
      `variables=${encodeURIComponent(JSON.stringify(variables))}` +
      `&features=${encodeURIComponent(JSON.stringify(features))}`

    const csrfToken = getCsrfToken()

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        authorization: `Bearer ${authToken}`,
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        pragma: 'no-cache',
        'sec-ch-ua':
          '"Chromium";v="120", "Google Chrome";v="120", "Not:A-Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'x-csrf-token': csrfToken,
        'x-twitter-active-user': 'yes',
        'x-twitter-auth-type': 'OAuth2Session',
        'x-twitter-client-language': 'en',
      },
      referrer: 'https://x.com/i/bookmarks',
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: null,
      mode: 'cors',
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[BookmarkX API] Error response:', errorText)
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    return parseBookmarksResponse(data)
  }

  function parseBookmarksResponse(data) {
    const bookmarks = []
    let nextCursor = null
    let hasMore = false

    try {
      const timeline = data?.data?.bookmark_timeline_v2?.timeline
      const instructions = timeline?.instructions || []

      instructions.forEach((instruction) => {
        if (instruction.type === 'TimelineAddEntries') {
          instruction.entries?.forEach((entry) => {
            if (entry.entryId?.startsWith('tweet-')) {
              const bookmark = parseTweetEntry(entry)
              if (bookmark) {
                bookmarks.push(bookmark)
              }
            }

            // Get cursor for next page
            if (entry.entryId?.startsWith('cursor-bottom')) {
              nextCursor = entry.content?.value
              hasMore = true
            }
          })
        }
      })
    } catch (error) {
      console.error('[BookmarkX API] Parse error:', error)
    }

    return { bookmarks, nextCursor, hasMore }
  }

  // EXACT copy from cookies-version service-worker.js line 342-389
  function parseTweetEntry(entry) {
    try {
      const itemContent = entry.content?.itemContent
      if (!itemContent) return null

      const tweetResults = itemContent.tweet_results?.result
      if (!tweetResults) return null

      // Handle different result types
      if (tweetResults.__typename === 'TweetWithVisibilityResults') {
        return parseTweet(tweetResults.tweet)
      }

      return parseTweet(tweetResults)
    } catch (error) {
      console.error('[BookmarkX API] Parse tweet error:', error)
      return null
    }
  }

  function parseTweet(tweet) {
    if (!tweet || !tweet.legacy) {
      console.warn('[BookmarkX API] Invalid tweet structure:', tweet)
      return null
    }

    const legacy = tweet.legacy
    const userResult = tweet.core?.user_results?.result

    // Twitter API has changed structure - user data is now split between core and legacy
    const userCore = userResult?.core
    const userLegacy = userResult?.legacy
    const userAvatar = userResult?.avatar

    return {
      id: tweet.rest_id,
      text: legacy.full_text || '',
      created_at: legacy.created_at,
      user: {
        id: userResult?.rest_id,
        screen_name:
          userCore?.screen_name || userLegacy?.screen_name || 'unknown',
        name: userCore?.name || userLegacy?.name || 'Unknown User',
        profile_image_url: (
          userAvatar?.image_url ||
          userLegacy?.profile_image_url_https ||
          ''
        ).replace('_normal', '_400x400'),
        verified: userResult?.is_blue_verified || userLegacy?.verified || false,
        followers_count: userLegacy?.followers_count || 0,
        description: userLegacy?.description || '',
      },
      favorite_count: legacy.favorite_count || 0,
      retweet_count: legacy.retweet_count || 0,
      reply_count: legacy.reply_count || 0,
      quote_count: legacy.quote_count || 0,
      bookmark_count: legacy.bookmark_count || 0,
      view_count: tweet.views?.count || 0,
      entities: legacy.entities || {},
      extended_entities: legacy.extended_entities || {},
      _raw: tweet,
    }
  }

  async function getTwitterCredentials() {
    // Get auth token from page scripts
    const authToken =
      'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA' // Twitter's public bearer token

    // Try to extract query ID dynamically from Twitter's bundled JS
    let queryId = null

    try {
      // Look through all script tags for the Bookmarks query ID
      const scripts = document.querySelectorAll('script')
      for (const script of scripts) {
        const content = script.textContent || script.innerText
        if (content && content.includes('Bookmarks')) {
          // Search for query ID pattern (22 character alphanumeric string)
          const matches = content.match(/queryId:"([a-zA-Z0-9_-]{22})"[,}].*Bookmarks/g)
          if (matches && matches.length > 0) {
            // Extract the queryId from the match
            const idMatch = matches[0].match(/queryId:"([a-zA-Z0-9_-]{22})"/)
            if (idMatch) {
              queryId = idMatch[1]
              break
            }
          }
        }
      }
    } catch (error) {
      console.error('[BookmarkX API] Error extracting queryId:', error)
    }

    // Fallback to hardcoded query ID if extraction failed
    if (!queryId) {
      queryId = 'ire7TB3NNzZOIa2SeD8pLA' // Fallback (as of Jan 2025)
    }

    return { authToken, queryId }
  }

  function getCsrfToken() {
    const cookies = document.cookie.split(';')
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'ct0') {
        return value
      }
    }
    return ''
  }

  function finishCollection() {
    // Remove progress banner
    const progressBanner = document.getElementById('bookmarkx-progress-banner')
    if (progressBanner) {
      progressBanner.remove()
    }

    // Transform to BookmarkX format
    const bookmarks = allBookmarks.map((tweet) => transformToBookmark(tweet))

    // Send transformed bookmarks to background script
    chrome.runtime.sendMessage(
      {
        type: 'EXTRACTION_COMPLETE',
        bookmarks: bookmarks,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            '[BookmarkX API] Error sending message:',
            chrome.runtime.lastError.message
          )
        }
      }
    )

    // Show completion banner
    showCompletionBanner()

    // Automatically open BookmarkX after 1 second
    setTimeout(() => {
      chrome.runtime.sendMessage({ type: 'OPEN_BOOKMARKX' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            '[BookmarkX API] Error opening BookmarkX:',
            chrome.runtime.lastError.message
          )
        }
      })
    }, 1000)
  }

  function transformToBookmark(tweet) {
    const tweetUrl = `https://x.com/${tweet.user.screen_name}/status/${tweet.id}`

    // Convert text to HTML with proper links
    const htmlContent = convertTextToHTML(tweet)

    // Clean text for title/description (remove URLs)
    let cleanText = tweet.text
    if (tweet.entities?.urls) {
      tweet.entities.urls.forEach((url) => {
        cleanText = cleanText.replace(url.url, '')
      })
    }
    if (tweet.entities?.media) {
      tweet.entities.media.forEach((media) => {
        cleanText = cleanText.replace(media.url, '')
      })
    }
    cleanText = cleanText.trim()

    return {
      id: Date.now() + Math.random(),
      user_id: 'chrome-extension',
      title: cleanText.substring(0, 100) || `Tweet by ${tweet.user.name}`,
      url: tweetUrl,
      description: cleanText.substring(0, 200),
      content: htmlContent,
      thumbnail_url: extractThumbnail(tweet),
      favicon_url: tweet.user.profile_image_url,
      author: `${tweet.user.name} (@${tweet.user.screen_name})`,
      domain: 'x.com',
      source_platform: 'twitter',
      source_id: tweet.id,
      engagement_score:
        (tweet.favorite_count || 0) +
        (tweet.retweet_count || 0) * 2 +
        (tweet.reply_count || 0),
      is_starred: false,
      is_read: false,
      is_archived: false,
      is_shared: false,
      is_deleted: false,
      tags: extractHashtags(tweet),
      collections: ['Imported from X'],
      metadata: {
        user: {
          id: tweet.user.id,
          name: tweet.user.name,
          screen_name: tweet.user.screen_name,
          profile_image_url: tweet.user.profile_image_url,
          verified: tweet.user.verified,
          followers_count: tweet.user.followers_count,
          description: tweet.user.description,
        },
        engagement: {
          likes: tweet.favorite_count || 0,
          retweets: tweet.retweet_count || 0,
          replies: tweet.reply_count || 0,
          quotes: tweet.quote_count || 0,
          bookmarks: tweet.bookmark_count || 0,
          views: tweet.view_count || 0,
        },
        import_date: new Date().toISOString(),
        import_source: 'chrome-extension-api',
        plain_text: tweet.text,
        has_media: !!(tweet.extended_entities?.media || tweet.entities?.media),
        media_count: (
          tweet.extended_entities?.media ||
          tweet.entities?.media ||
          []
        ).length,
      },
      created_at: new Date(tweet.created_at).toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  function extractThumbnail(tweet) {
    const media = tweet.extended_entities?.media || tweet.entities?.media
    if (media && media.length > 0) {
      return media[0].media_url_https || media[0].media_url
    }
    return tweet.user.profile_image_url || null
  }

  function extractHashtags(tweet) {
    const tags = []
    const hashtags = tweet.entities?.hashtags || []
    hashtags.forEach((h) => {
      tags.push(h.text.toLowerCase())
    })

    const professional = tweet._raw?.core?.user_results?.result?.professional
    if (professional?.category && professional.category.length > 0) {
      professional.category.forEach((cat) => {
        const categoryTag = cat.name.toLowerCase().replace(/\s+/g, '-')
        tags.push(categoryTag)
      })
    }

    return [...new Set(tags)]
  }

  function convertTextToHTML(tweet) {
    let html = tweet.text
    const entities = tweet.entities

    if (!entities) return escapeHtml(html)

    const allEntities = []

    if (entities.urls) {
      entities.urls.forEach((url) => {
        allEntities.push({
          start: url.indices[0],
          end: url.indices[1],
          type: 'url',
          display: url.display_url || url.url,
          expanded: url.expanded_url || url.url,
        })
      })
    }

    if (entities.hashtags) {
      entities.hashtags.forEach((hashtag) => {
        allEntities.push({
          start: hashtag.indices[0],
          end: hashtag.indices[1],
          type: 'hashtag',
          text: hashtag.text,
        })
      })
    }

    if (entities.user_mentions) {
      entities.user_mentions.forEach((mention) => {
        allEntities.push({
          start: mention.indices[0],
          end: mention.indices[1],
          type: 'mention',
          screen_name: mention.screen_name,
        })
      })
    }

    if (entities.media) {
      entities.media.forEach((media) => {
        allEntities.push({
          start: media.indices[0],
          end: media.indices[1],
          type: 'media',
          url: media.media_url_https,
        })
      })
    }

    allEntities.sort((a, b) => b.start - a.start)

    allEntities.forEach((entity) => {
      const before = html.substring(0, entity.start)
      const after = html.substring(entity.end)
      let replacement = ''

      switch (entity.type) {
        case 'url':
          replacement = `<a href="${escapeHtml(entity.expanded)}" target="_blank" rel="noopener noreferrer" class="tweet-link">${escapeHtml(entity.display)}</a>`
          break
        case 'hashtag':
          replacement = `<a href="https://x.com/hashtag/${entity.text}" target="_blank" rel="noopener noreferrer" class="tweet-hashtag">#${escapeHtml(entity.text)}</a>`
          break
        case 'mention':
          replacement = `<a href="https://x.com/${entity.screen_name}" target="_blank" rel="noopener noreferrer" class="tweet-mention">@${escapeHtml(entity.screen_name)}</a>`
          break
        case 'media':
          replacement = ''
          break
      }

      html = before + replacement + after
    })

    html = html.replace(/\n/g, '<br>')
    return html
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  function showCompletionBanner() {
    const banner = document.createElement('div')
    banner.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 20px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 400px;
    `

    banner.innerHTML = `
      <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">
        ✓ Extraction Complete!
      </h3>
      <p style="margin: 0 0 12px 0; font-size: 14px; opacity: 0.9;">
        Successfully extracted ${allBookmarks.length} bookmarks in seconds!
      </p>
      <button id="openBookmarkX" style="
        background: white;
        color: #059669;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
        width: 100%;
      ">
        Open in BookmarkX
      </button>
    `

    document.body.appendChild(banner)

    document.getElementById('openBookmarkX').addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_BOOKMARKX' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            '[BookmarkX API] Error opening BookmarkX:',
            chrome.runtime.lastError.message
          )
        }
      })
      banner.remove()
    })

    setTimeout(() => {
      if (banner.parentNode) {
        banner.remove()
      }
    }, 15000)
  }

  function showError(message) {
    const banner = document.createElement('div')
    banner.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 20px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 400px;
    `

    banner.innerHTML = `
      <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">
        ❌ Error
      </h3>
      <p style="margin: 0; font-size: 14px; opacity: 0.9;">
        ${message}
      </p>
    `

    document.body.appendChild(banner)

    setTimeout(() => {
      if (banner.parentNode) {
        banner.remove()
      }
    }, 10000)
  }
})()
