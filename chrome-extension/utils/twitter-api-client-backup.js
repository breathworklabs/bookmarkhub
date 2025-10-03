/**
 * TwitterAPIClient - Direct API access using existing session
 * No API keys required - uses user's existing X/Twitter login
 */

class TwitterAPIClient {
  constructor() {
    this.baseUrl = 'https://twitter.com/i/api';
    this.maxRequests = 50; // Safety limit
    this.requestDelay = 1000; // 1 second between requests
  }

  /**
   * Check if user is logged into Twitter
   */
  async checkTwitterLogin() {
    try {
      // Method 1: Check session storage for Twitter session data
      if (this.checkSessionStorage()) {
        console.log('Login detected via session storage');
        return true;
      }

      // Method 2: Check localStorage for Twitter session data
      if (this.checkLocalStorage()) {
        console.log('Login detected via localStorage');
        return true;
      }

      // Method 3: Check cookies for Twitter session
      if (this.checkCookies()) {
        console.log('Login detected via cookies');
        return true;
      }

      // Method 4: Fallback to API call
      const response = await fetch(`${this.baseUrl}/1.1/account/verify_credentials.json`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Twitter-Active-User': 'yes',
          'X-Twitter-Auth-Type': 'OAuth2Session'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error checking Twitter login:', error);
      return false;
    }
  }

  /**
   * Check session storage for Twitter session data
   */
  checkSessionStorage() {
    try {
      const sessionKeys = Object.keys(sessionStorage);

      // Look for Twitter session indicators
      const sessionIndicators = [
        'auth_token',
        'ct0',
        'guest_id',
        'personalization_id',
        'twitter_session',
        'user_id'
      ];

      for (const key of sessionKeys) {
        if (sessionIndicators.some(indicator => key.toLowerCase().includes(indicator))) {
          console.log('Found session storage key:', key);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking session storage:', error);
      return false;
    }
  }

  /**
   * Check localStorage for Twitter session data
   */
  checkLocalStorage() {
    try {
      const localKeys = Object.keys(localStorage);

      // Look for Twitter session indicators
      const sessionIndicators = [
        'auth_token',
        'ct0',
        'guest_id',
        'personalization_id',
        'twitter_session',
        'user_id',
        'twitter_ads_id'
      ];

      for (const key of localKeys) {
        if (sessionIndicators.some(indicator => key.toLowerCase().includes(indicator))) {
          console.log('Found localStorage key:', key);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking localStorage:', error);
      return false;
    }
  }

  /**
   * Check cookies for Twitter session
   */
  checkCookies() {
    try {
      const cookies = document.cookie.split(';');

      // Look for Twitter session cookies
      const sessionCookies = [
        'auth_token',
        'ct0',
        'guest_id',
        'personalization_id',
        'twitter_session'
      ];

      for (const cookie of cookies) {
        const cookieName = cookie.split('=')[0].trim();
        if (sessionCookies.some(sessionCookie => cookieName.includes(sessionCookie))) {
          console.log('Found session cookie:', cookieName);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking cookies:', error);
      return false;
    }
  }

  /**
   * Fetch bookmarks from Twitter API
   */
  async fetchBookmarks(cursor = null) {
    const url = this.buildBookmarkURL(cursor);

    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Use existing session
        headers: {
          'Accept': 'application/json',
          'X-Twitter-Active-User': 'yes',
          'X-Twitter-Auth-Type': 'OAuth2Session',
          'X-Twitter-Client-Language': 'en',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      throw error;
    }
  }

  /**
   * Build bookmark API URL with parameters (using the same endpoint as X/Twitter's bookmark page)
   */
  buildBookmarkURL(cursor) {
    // Use the exact same endpoint that X/Twitter's bookmark page uses
    const params = new URLSearchParams({
      count: '20',
      include_entities: 'true',
      include_ext_alt_text: 'true',
      include_quote_count: 'true',
      include_reply_count: 'true',
      include_retweet_count: 'true',
      tweet_mode: 'extended',
      include_user_entities: 'true',
      include_cards: 'true',
      include_media_features: 'true',
      include_place: 'true',
      include_quote_count: 'true',
      include_reply_count: 'true',
      include_retweet_count: 'true',
      include_quote_count: 'true',
      include_reply_count: 'true',
      include_retweet_count: 'true'
    });

    if (cursor) {
      params.append('cursor', cursor);
    }

    // Use the exact same endpoint as X/Twitter's bookmark page
    return `${this.baseUrl}/2/timeline/bookmark.json?${params.toString()}`;
  }

  /**
   * Extract all bookmarks by navigating to bookmark page and scrolling
   */
  async extractAllBookmarks() {
    console.log('Starting bookmark extraction...');

    try {
      // Navigate to bookmark page if not already there
      if (!window.location.href.includes('/i/bookmarks')) {
        console.log('Navigating to bookmark page...');
        window.location.href = 'https://twitter.com/i/bookmarks';
        await this.delay(3000); // Wait for page to load
      }

      // Extract bookmarks from the current page
      const bookmarks = await this.extractBookmarksFromPage();

      console.log(`Total bookmarks extracted: ${bookmarks.length}`);
      return bookmarks;

    } catch (error) {
      console.error('Error in bookmark extraction:', error);
      throw error;
    }
  }

  /**
   * Extract bookmarks from the current page by scrolling and parsing DOM
   */
  async extractBookmarksFromPage() {
    const allBookmarks = [];
    let previousHeight = 0;
    let currentHeight = document.body.scrollHeight;
    let scrollAttempts = 0;
    const maxScrollAttempts = 10;

    console.log('Extracting bookmarks from page...');

    // Scroll to load all bookmarks
    while (currentHeight > previousHeight && scrollAttempts < maxScrollAttempts) {
      // Extract bookmarks from current view
      const currentBookmarks = this.extractVisibleBookmarks();
      allBookmarks.push(...currentBookmarks);

      console.log(`Found ${currentBookmarks.length} bookmarks, total: ${allBookmarks.length}`);

      // Scroll down
      window.scrollTo(0, document.body.scrollHeight);
      await this.delay(2000); // Wait for new content to load

      previousHeight = currentHeight;
      currentHeight = document.body.scrollHeight;
      scrollAttempts++;
    }

    // Remove duplicates based on tweet ID
    const uniqueBookmarks = this.removeDuplicateBookmarks(allBookmarks);

    console.log(`Extracted ${uniqueBookmarks.length} unique bookmarks`);
    return uniqueBookmarks;
  }

  /**
   * Extract bookmarks from currently visible tweets
   */
  extractVisibleBookmarks() {
    const bookmarks = [];
    const tweetElements = document.querySelectorAll('[data-testid="tweet"]');

    tweetElements.forEach(element => {
      try {
        const bookmark = this.parseTweetElement(element);
        if (bookmark) {
          bookmarks.push(bookmark);
        }
      } catch (error) {
        console.error('Error parsing tweet element:', error);
      }
    });

    return bookmarks;
  }

  /**
   * Parse a tweet element from the DOM
   */
  parseTweetElement(element) {
    try {
      // Extract tweet text
      const textElement = element.querySelector('[data-testid="tweetText"]');
      const text = textElement ? textElement.textContent : '';

      // Extract user info
      const userElement = element.querySelector('[data-testid="User-Name"]');
      const username = userElement ? userElement.textContent.split('·')[0].trim() : 'Unknown';

      // Extract tweet link
      const linkElement = element.querySelector('a[href*="/status/"]');
      const tweetUrl = linkElement ? linkElement.href : '';
      const tweetId = tweetUrl.match(/\/status\/(\d+)/)?.[1];

      // Extract timestamp
      const timeElement = element.querySelector('time');
      const timestamp = timeElement ? timeElement.getAttribute('datetime') : new Date().toISOString();

      // Extract media
      const mediaElements = element.querySelectorAll('[data-testid="tweetPhoto"], [data-testid="videoPlayer"]');
      const media = Array.from(mediaElements).map(media => ({
        type: media.getAttribute('data-testid') === 'videoPlayer' ? 'video' : 'photo',
        url: media.querySelector('img')?.src || ''
      }));

      if (!tweetId || !text) {
        return null;
      }

      return {
        id: tweetId,
        text: text,
        username: username,
        url: tweetUrl,
        createdAt: timestamp,
        media: media,
        engagement: {
          likes: 0,
          retweets: 0,
          replies: 0
        },
        user: {
          screen_name: username,
          name: username
        }
      };

    } catch (error) {
      console.error('Error parsing tweet element:', error);
      return null;
    }
  }

  /**
   * Remove duplicate bookmarks based on tweet ID
   */
  removeDuplicateBookmarks(bookmarks) {
    const seen = new Set();
    return bookmarks.filter(bookmark => {
      if (seen.has(bookmark.id)) {
        return false;
      }
      seen.add(bookmark.id);
      return true;
    });
  }

  /**
   * Parse timeline instructions to extract bookmark data
   */
  parseTimelineInstructions(instructions) {
    const bookmarks = [];

    instructions.forEach(instruction => {
      if (instruction.type === 'TimelineAddEntries') {
        instruction.entries.forEach(entry => {
          if (entry.content?.entryType === 'TimelineTimelineItem') {
            const tweet = entry.content.itemContent?.tweet_results?.result;
            if (tweet) {
              bookmarks.push(this.transformTweetToBookmark(tweet));
            }
          }
        });
      }
    });

    return bookmarks;
  }

  /**
   * Extract next cursor from API response
   */
  extractNextCursor(response) {
    if (response.instructions) {
      for (const instruction of response.instructions) {
        if (instruction.type === 'TimelineAddEntries') {
          for (const entry of instruction.entries) {
            if (entry.content?.entryType === 'TimelineTimelineCursor' &&
                entry.content.cursorType === 'Bottom') {
              return entry.content.value;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Transform Twitter tweet data to bookmark format
   */
  transformTweetToBookmark(tweet) {
    return {
      id: tweet.rest_id || tweet.id_str,
      text: tweet.full_text || tweet.text,
      username: tweet.user?.screen_name,
      displayName: tweet.user?.name,
      url: `https://twitter.com/${tweet.user?.screen_name}/status/${tweet.rest_id}`,
      createdAt: tweet.created_at,
      media: tweet.extended_entities?.media || [],
      engagement: {
        likes: tweet.favorite_count || 0,
        retweets: tweet.retweet_count || 0,
        replies: tweet.reply_count || 0
      },
      user: {
        id: tweet.user?.id_str,
        screen_name: tweet.user?.screen_name,
        name: tweet.user?.name,
        profile_image_url: tweet.user?.profile_image_url_https
      }
    };
  }

  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Make class available globally for content scripts
window.TwitterAPIClient = TwitterAPIClient;
