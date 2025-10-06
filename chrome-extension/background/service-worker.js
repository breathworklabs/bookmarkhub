/**
 * Background Service Worker - Automated Bookmark Extraction
 * This runs in a privileged context and can make API calls without CORS restrictions
 */

class BookmarkExtractor {
  constructor() {
    this.queryId = 'ire7TB3NNzZOIa2SeD8pLA'; // Current as of Oct 2025
    this.baseUrl = 'https://x.com/i/api/graphql';
    this.bearerToken = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';
  }

  /**
   * Main extraction method - extracts all bookmarks automatically
   */
  async extractAllBookmarks(options = {}) {
    const { maxBookmarks = 5000, onProgress = null } = options;

    try {
      // Check authentication
      const isAuthenticated = await this.checkAuth();
      if (!isAuthenticated) {
        throw new Error('Not logged into X/Twitter. Please log in first.');
      }

      // Clear old extension storage before fresh extraction
      console.log('Clearing old bookmark cache...');
      await chrome.storage.local.clear();

      let allBookmarks = [];
      let cursor = null;
      let hasMore = true;
      let requestCount = 0;
      const maxRequests = 100; // Safety limit

      console.log('Starting automated bookmark extraction...');

      while (hasMore && allBookmarks.length < maxBookmarks && requestCount < maxRequests) {
        // Fetch batch
        console.log(`Fetching batch ${requestCount + 1}, cursor: ${cursor ? cursor.substring(0, 20) + '...' : 'initial'}`);

        const batch = await this.fetchBookmarkBatch(cursor);

        // Parse tweets from response
        const tweets = this.parseBatchResponse(batch);

        // If no tweets found, stop even if there's a cursor
        if (tweets.length === 0) {
          console.log('No more bookmarks found, stopping extraction');
          hasMore = false;
          break;
        }

        allBookmarks.push(...tweets);

        // Get next cursor
        cursor = this.extractCursor(batch);
        hasMore = !!cursor;
        requestCount++;

        console.log(`Batch ${requestCount}: Got ${tweets.length} bookmarks, total: ${allBookmarks.length}, hasMore: ${hasMore}`);

        // Progress callback
        if (onProgress) {
          onProgress({
            count: allBookmarks.length,
            hasMore,
            batchCount: requestCount
          });
        }

        // Rate limiting - wait 1-2 seconds between requests
        if (hasMore) {
          await this.delay(1000 + Math.random() * 1000);
        }
      }

      console.log(`Extraction complete: ${allBookmarks.length} bookmarks extracted`);

      // Transform to bookmark format
      const bookmarks = allBookmarks.map(tweet => this.transformToBookmark(tweet));

      // Debug: Log first bookmark to see structure
      if (bookmarks.length > 0) {
        console.log('📊 Sample bookmark data:', {
          title: bookmarks[0].title,
          author: bookmarks[0].author,
          favicon_url: bookmarks[0].favicon_url,
          user_data: bookmarks[0].metadata?.user,
          engagement: bookmarks[0].metadata?.engagement
        });
      }

      // Save to storage
      const saveResult = await this.saveBookmarks(bookmarks);

      // Notify all localhost tabs to sync immediately
      await this.notifyLocalhostTabs();

      return {
        success: true,
        count: allBookmarks.length,
        saved: saveResult.saved,
        duplicates: saveResult.duplicates,
        hasMore,
        method: 'api'
      };

    } catch (error) {
      console.error('Extraction failed:', error);
      return {
        success: false,
        error: error.message,
        method: 'api'
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  async checkAuth() {
    try {
      const cookies = await this.getCookies();
      return !!(cookies.auth_token && cookies.ct0);
    } catch {
      return false;
    }
  }

  /**
   * Get Twitter authentication cookies
   */
  async getCookies() {
    const cookieNames = ['auth_token', 'ct0', 'twid'];
    const cookies = {};

    for (const name of cookieNames) {
      // Try x.com first, then twitter.com
      for (const domain of ['x.com', 'twitter.com']) {
        const cookie = await chrome.cookies.get({
          url: `https://${domain}`,
          name: name
        });

        if (cookie) {
          cookies[name] = cookie.value;
          break;
        }
      }
    }

    if (!cookies.auth_token || !cookies.ct0) {
      throw new Error('Missing authentication cookies. Please log in to X/Twitter.');
    }

    return cookies;
  }

  /**
   * Build cookie string for headers
   */
  buildCookieString(cookies) {
    return Object.entries(cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }

  /**
   * Fetch a batch of bookmarks from X API
   */
  async fetchBookmarkBatch(cursor = null, count = 100) {
    const cookies = await this.getCookies();

    // Build variables
    const variables = {
      count,
      includePromotedContent: false
    };

    if (cursor) {
      variables.cursor = cursor;
    }

    // Current feature flags (as of Oct 2025)
    const features = {
      rweb_video_screen_enabled: false,
      payments_enabled: false,
      profile_label_improvements_pcf_label_in_post_enabled: true,
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
      responsive_web_enhance_cards_enabled: false
    };

    // Build URL
    const url = `${this.baseUrl}/${this.queryId}/Bookmarks?` +
      `variables=${encodeURIComponent(JSON.stringify(variables))}` +
      `&features=${encodeURIComponent(JSON.stringify(features))}`;

    // Make request with proper headers
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${this.bearerToken}`,
        'x-csrf-token': cookies.ct0,
        'cookie': this.buildCookieString(cookies),
        'x-twitter-active-user': 'yes',
        'x-twitter-auth-type': 'OAuth2Session',
        'x-twitter-client-language': 'en',
        'content-type': 'application/json',
        'accept': '*/*',
        'referer': 'https://x.com/i/bookmarks',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in to X/Twitter.');
      }
      if (response.status === 429) {
        throw new Error('Rate limited. Please wait and try again.');
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Parse batch response and extract tweets
   */
  parseBatchResponse(response) {
    const tweets = [];

    try {
      const timeline = response?.data?.bookmark_timeline_v2?.timeline;
      if (!timeline) {
        console.warn('No timeline data in response');
        return tweets;
      }

      const instructions = timeline.instructions || [];

      for (const instruction of instructions) {
        if (instruction.type === 'TimelineAddEntries') {
          const entries = instruction.entries || [];

          for (const entry of entries) {
            // Skip cursor entries
            if (entry.content?.entryType === 'TimelineTimelineCursor') {
              continue;
            }

            const tweet = this.extractTweetFromEntry(entry);
            if (tweet) {
              tweets.push(tweet);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing batch response:', error);
    }

    return tweets;
  }

  /**
   * Extract tweet data from timeline entry
   */
  extractTweetFromEntry(entry) {
    try {
      const itemContent = entry.content?.itemContent;
      if (!itemContent) return null;

      const tweetResults = itemContent.tweet_results?.result;
      if (!tweetResults) return null;

      // Handle different result types
      if (tweetResults.__typename === 'TweetWithVisibilityResults') {
        return this.parseTweet(tweetResults.tweet);
      }

      return this.parseTweet(tweetResults);
    } catch (error) {
      console.error('Error extracting tweet from entry:', error);
      return null;
    }
  }

  /**
   * Parse tweet object with complete user and engagement data
   */
  parseTweet(tweet) {
    if (!tweet || !tweet.legacy) {
      console.warn('Invalid tweet structure:', tweet);
      return null;
    }

    const legacy = tweet.legacy;
    const userResult = tweet.core?.user_results?.result;

    // Twitter API has changed structure - user data is now split between core and legacy
    const userCore = userResult?.core;
    const userLegacy = userResult?.legacy;
    const userAvatar = userResult?.avatar;

    const parsedTweet = {
      id: tweet.rest_id,
      text: legacy.full_text || '',
      created_at: legacy.created_at,
      user: {
        id: userResult?.rest_id,
        // Name and screen_name are now in userResult.core
        screen_name: userCore?.screen_name || userLegacy?.screen_name || 'unknown',
        name: userCore?.name || userLegacy?.name || 'Unknown User',
        // Profile image is now in userResult.avatar.image_url
        profile_image_url: (userAvatar?.image_url || userLegacy?.profile_image_url_https || '')
          .replace('_normal', '_400x400'),
        verified: userResult?.is_blue_verified || userLegacy?.verified || false,
        followers_count: userLegacy?.followers_count || 0,
        description: userLegacy?.description || ''
      },
      favorite_count: legacy.favorite_count || 0,
      retweet_count: legacy.retweet_count || 0,
      reply_count: legacy.reply_count || 0,
      quote_count: legacy.quote_count || 0,
      bookmark_count: legacy.bookmark_count || 0,
      view_count: tweet.views?.count || 0,
      entities: legacy.entities || {},
      extended_entities: legacy.extended_entities || {},
      // Store full tweet object for reference
      _raw: tweet
    };

    return parsedTweet;
  }

  /**
   * Extract pagination cursor from response
   */
  extractCursor(response) {
    try {
      const timeline = response?.data?.bookmark_timeline_v2?.timeline;
      if (!timeline) return null;

      const instructions = timeline.instructions || [];

      for (const instruction of instructions) {
        if (instruction.type === 'TimelineAddEntries') {
          const entries = instruction.entries || [];

          // Find cursor entry (usually last entry)
          for (const entry of entries.slice().reverse()) {
            if (entry.content?.entryType === 'TimelineTimelineCursor') {
              if (entry.content.cursorType === 'Bottom') {
                return entry.content.value;
              }
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error extracting cursor:', error);
      return null;
    }
  }

  /**
   * Transform tweet to bookmark format with enhanced data
   */
  transformToBookmark(tweet) {
    const tweetUrl = `https://x.com/${tweet.user.screen_name}/status/${tweet.id}`;

    // Convert text to HTML with proper links
    const htmlContent = this.convertTextToHTML(tweet);

    // Clean text for title/description (remove URLs)
    let cleanText = tweet.text;
    if (tweet.entities?.urls) {
      tweet.entities.urls.forEach(url => {
        cleanText = cleanText.replace(url.url, '');
      });
    }
    if (tweet.entities?.media) {
      tweet.entities.media.forEach(media => {
        cleanText = cleanText.replace(media.url, '');
      });
    }
    cleanText = cleanText.trim();

    return {
      id: Date.now() + Math.random(),
      user_id: 'chrome-extension',
      title: cleanText.substring(0, 100) || `Tweet by ${tweet.user.name}`,
      url: tweetUrl,
      description: cleanText.substring(0, 200),
      content: htmlContent, // HTML formatted content with links
      thumbnail_url: this.extractThumbnail(tweet),
      favicon_url: tweet.user.profile_image_url, // Use user's profile image as favicon
      author: `${tweet.user.name} (@${tweet.user.screen_name})`, // Full author with handle
      domain: 'x.com',
      source_platform: 'twitter',
      source_id: tweet.id,
      engagement_score: (tweet.favorite_count || 0) + (tweet.retweet_count || 0) * 2 + (tweet.reply_count || 0),
      is_starred: false,
      is_read: false,
      is_archived: false,
      tags: this.extractHashtags(tweet),
      collections: ['Imported from X'],
      metadata: {
        // Store complete user data
        user: {
          id: tweet.user.id,
          name: tweet.user.name,
          screen_name: tweet.user.screen_name,
          profile_image_url: tweet.user.profile_image_url,
          verified: tweet.user.verified,
          followers_count: tweet.user.followers_count,
          description: tweet.user.description
        },
        // Complete engagement metrics
        engagement: {
          likes: tweet.favorite_count || 0,
          retweets: tweet.retweet_count || 0,
          replies: tweet.reply_count || 0,
          quotes: tweet.quote_count || 0,
          bookmarks: tweet.bookmark_count || 0,
          views: tweet.view_count || 0
        },
        // Import metadata
        import_date: new Date().toISOString(),
        import_source: 'chrome-extension-api',
        // Store plain text version
        plain_text: tweet.text,
        // Media information
        has_media: !!(tweet.extended_entities?.media || tweet.entities?.media),
        media_count: (tweet.extended_entities?.media || tweet.entities?.media || []).length
      },
      created_at: new Date(tweet.created_at).toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Extract thumbnail from tweet media
   */
  extractThumbnail(tweet) {
    const media = tweet.extended_entities?.media || tweet.entities?.media;
    if (media && media.length > 0) {
      return media[0].media_url_https || media[0].media_url;
    }
    return tweet.user.profile_image_url || null;
  }

  /**
   * Extract hashtags from tweet
   */
  extractHashtags(tweet) {
    const hashtags = tweet.entities?.hashtags || [];
    return ['twitter', ...hashtags.map(h => h.text.toLowerCase())];
  }

  /**
   * Convert tweet text to HTML with proper links
   */
  convertTextToHTML(tweet) {
    let html = tweet.text;
    const entities = tweet.entities;

    if (!entities) return this.escapeHtml(html);

    // Collect all entities with their indices
    const allEntities = [];

    // URLs
    if (entities.urls) {
      entities.urls.forEach(url => {
        allEntities.push({
          start: url.indices[0],
          end: url.indices[1],
          type: 'url',
          display: url.display_url || url.url,
          expanded: url.expanded_url || url.url
        });
      });
    }

    // Hashtags
    if (entities.hashtags) {
      entities.hashtags.forEach(hashtag => {
        allEntities.push({
          start: hashtag.indices[0],
          end: hashtag.indices[1],
          type: 'hashtag',
          text: hashtag.text
        });
      });
    }

    // Mentions
    if (entities.user_mentions) {
      entities.user_mentions.forEach(mention => {
        allEntities.push({
          start: mention.indices[0],
          end: mention.indices[1],
          type: 'mention',
          screen_name: mention.screen_name
        });
      });
    }

    // Media (remove from text)
    if (entities.media) {
      entities.media.forEach(media => {
        allEntities.push({
          start: media.indices[0],
          end: media.indices[1],
          type: 'media',
          url: media.media_url_https
        });
      });
    }

    // Sort by start index in reverse order to replace from end to start
    allEntities.sort((a, b) => b.start - a.start);

    // Replace entities with HTML
    allEntities.forEach(entity => {
      const before = html.substring(0, entity.start);
      const after = html.substring(entity.end);
      let replacement = '';

      switch (entity.type) {
        case 'url':
          replacement = `<a href="${this.escapeHtml(entity.expanded)}" target="_blank" rel="noopener noreferrer" class="tweet-link">${this.escapeHtml(entity.display)}</a>`;
          break;
        case 'hashtag':
          replacement = `<a href="https://x.com/hashtag/${entity.text}" target="_blank" rel="noopener noreferrer" class="tweet-hashtag">#${this.escapeHtml(entity.text)}</a>`;
          break;
        case 'mention':
          replacement = `<a href="https://x.com/${entity.screen_name}" target="_blank" rel="noopener noreferrer" class="tweet-mention">@${this.escapeHtml(entity.screen_name)}</a>`;
          break;
        case 'media':
          // Remove media URLs from text (they'll be shown as thumbnails)
          replacement = '';
          break;
      }

      html = before + replacement + after;
    });

    // Convert newlines to <br>
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  /**
   * Escape HTML special characters
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Save bookmarks to chrome.storage.local
   * Note: Storage is cleared before each extraction, so these are always fresh
   */
  async saveBookmarks(newBookmarks) {
    try {
      // Storage is already cleared, just save the new bookmarks
      await chrome.storage.local.set({ bookmarks: newBookmarks });

      return {
        saved: newBookmarks.length,
        duplicates: 0,
        total: newBookmarks.length
      };

    } catch (error) {
      console.error('Error saving bookmarks:', error);
      throw error;
    }
  }

  /**
   * Notify localhost tabs to sync immediately
   */
  async notifyLocalhostTabs() {
    try {
      // Find all localhost tabs
      const tabs = await chrome.tabs.query({
        url: ['http://localhost/*', 'http://127.0.0.1/*']
      });

      console.log(`📢 Notifying ${tabs.length} localhost tab(s) to sync bookmarks`);

      // Send sync message to each tab
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'SYNC_NOW' });
          console.log(`✅ Notified tab ${tab.id} at ${tab.url}`);
        } catch (error) {
          console.log(`⚠️ Could not notify tab ${tab.id}:`, error.message);
        }
      }

      // Also create/activate a tab if none exist
      if (tabs.length === 0) {
        console.log('📌 No localhost tabs found, opening default URL...');
        await chrome.tabs.create({ url: 'http://localhost:3000' });
      }

    } catch (error) {
      console.error('Error notifying tabs:', error);
    }
  }

  /**
   * Delay utility
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global extractor instance
const extractor = new BookmarkExtractor();

// Message handler from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXTRACT_BOOKMARKS') {
    console.log('Received extraction request from popup');

    // Handle extraction asynchronously
    extractor.extractAllBookmarks({
      maxBookmarks: request.maxBookmarks || 5000,
      onProgress: (progress) => {
        // Send progress updates to popup
        try {
          chrome.runtime.sendMessage({
            type: 'EXTRACTION_PROGRESS',
            ...progress
          });
        } catch (error) {
          console.error('Error sending progress update:', error);
        }
      }
    }).then(result => {
      console.log('Extraction complete:', result);
      sendResponse(result);
    }).catch(error => {
      console.error('Extraction error:', error);
      sendResponse({
        success: false,
        error: error.message
      });
    });

    return true; // Keep message channel open for async response
  }

  if (request.action === 'CHECK_AUTH') {
    extractor.checkAuth().then(isAuth => {
      sendResponse({ authenticated: isAuth });
    });
    return true;
  }
});

console.log('X Bookmark Manager - Service Worker initialized');
