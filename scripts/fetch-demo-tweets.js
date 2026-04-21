#!/usr/bin/env node

/**
 * Fetch live demo tweets from TwitterAPI.io and save as static JSON
 * Run this script daily to keep demo data fresh
 *
 * Usage: node scripts/fetch-demo-tweets.js
 *
 * Requires: TWITTER_API_KEY environment variable
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const TWITTER_API_KEY = process.env.TWITTER_API_KEY || process.env.VITE_TWITTER_API_KEY
const TWITTER_API_BASE_URL = 'https://api.twitterapi.io'
const OUTPUT_PATH = path.join(__dirname, '../public/demo-tweets.json')
const TWEETS_PER_ACCOUNT = 3
const MAX_TOTAL_TWEETS = 25

const TECH_ACCOUNTS = [
  'vercel',
  'reactjs',
  'typescript',
  'AnthropicAI',
  'OpenAI',
  'tailwindcss',
  'remix_run',
  'astrodotbuild',
]

// Delay helper for rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Fetch tweets from a specific user
 */
async function fetchUserTweets(username, limit = 3) {
  const url = `${TWITTER_API_BASE_URL}/twitter/user/last_tweets?userName=${username}`

  console.log(`Fetching ${limit} tweets from @${username}...`)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': TWITTER_API_KEY,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.warn(`Failed for @${username}: ${response.status} ${errorText}`)
      return []
    }

    const data = await response.json()

    if (data.status !== 'success' || !data.data?.tweets) {
      console.warn(`No tweets returned for @${username}`)
      return []
    }

    const tweets = data.data.tweets.slice(0, limit)
    console.log(`✓ Fetched ${tweets.length} tweets from @${username}`)

    return tweets
  } catch (error) {
    console.error(`Error fetching @${username}:`, error.message)
    return []
  }
}

/**
 * Convert TwitterAPI.io tweet to our Bookmark format
 */
function convertToBookmark(tweet, index) {
  const author = tweet.author

  // Extract only actual hashtags from the tweet (no content-based tag generation)
  const hashtags = tweet.entities?.hashtags?.map(tag => tag.text.toLowerCase()) || []

  // Limit to first 5 hashtags
  const allTags = hashtags.slice(0, 5)

  return {
    id: index + 1,
    user_id: 'demo-user',
    title: tweet.text.substring(0, 100) || 'Tweet',
    url: tweet.url,
    description: tweet.text,
    content: tweet.text,
    thumbnail_url: null,
    favicon_url: author.profilePicture,
    author: author.name,
    domain: 'x.com',
    source_platform: 'twitter',
    source_id: tweet.id,
    engagement_score: tweet.likeCount + tweet.retweetCount,
    is_starred: false, // Don't pre-star in static data
    is_read: false,
    is_archived: false,
    is_shared: false,
    is_deleted: false,
    tags: allTags,
    collections: ['uncategorized'],
    metadata: {
      profile_image_normal: author.profilePicture,
      profile_image_bigger: author.profilePicture?.replace('_normal', '_bigger'),
      tweet_date: tweet.createdAt,
      favorite_count: tweet.likeCount,
      retweet_count: tweet.retweetCount,
      reply_count: tweet.replyCount,
      view_count: tweet.viewCount,
      is_verified: author.isVerified,
      is_blue_verified: author.isBlueVerified,
      author_followers: author.followers,
      author_username: author.userName,
      // Engagement data in the format expected by BookmarkFooter
      engagement: {
        likes: tweet.likeCount,
        retweets: tweet.retweetCount,
        replies: tweet.replyCount,
      },
    },
    created_at: new Date(tweet.createdAt).toISOString(),
    updated_at: new Date(tweet.createdAt).toISOString(),
    _isDemo: true,
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting demo tweet fetch...\n')

  // Validate API key
  if (!TWITTER_API_KEY) {
    console.error('❌ Error: TWITTER_API_KEY environment variable is required')
    console.error('Set it with: export TWITTER_API_KEY=your_api_key_here')
    process.exit(1)
  }

  const allTweets = []

  // Fetch tweets from each account with rate limiting
  for (let i = 0; i < TECH_ACCOUNTS.length; i++) {
    const account = TECH_ACCOUNTS[i]

    // Add delay between requests (free tier: 1 request per 5 seconds)
    if (i > 0) {
      console.log(`⏳ Waiting 5 seconds... (rate limit)`)
      await delay(5000)
    }

    const tweets = await fetchUserTweets(account, TWEETS_PER_ACCOUNT)
    allTweets.push(...tweets)
  }

  if (allTweets.length === 0) {
    console.error('\n❌ No tweets fetched from any account')
    process.exit(1)
  }

  console.log(`\n📊 Total tweets fetched: ${allTweets.length}`)

  // Sort by engagement and take top tweets
  const topTweets = allTweets
    .sort((a, b) => (b.likeCount + b.retweetCount) - (a.likeCount + a.retweetCount))
    .slice(0, MAX_TOTAL_TWEETS)

  console.log(`📈 Selected top ${topTweets.length} tweets by engagement`)

  // Convert to bookmark format
  const bookmarks = topTweets.map((tweet, index) => convertToBookmark(tweet, index))

  // Create output directory if it doesn't exist
  const outputDir = path.dirname(OUTPUT_PATH)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Save to JSON file
  const output = {
    generated_at: new Date().toISOString(),
    source: 'TwitterAPI.io',
    accounts: TECH_ACCOUNTS,
    count: bookmarks.length,
    bookmarks,
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8')

  console.log(`\n✅ Successfully saved ${bookmarks.length} demo tweets to:`)
  console.log(`   ${OUTPUT_PATH}`)
  console.log(`\n🎉 Done! Demo data is ready to use.`)
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})
