#!/usr/bin/env node

/**
 * Market Prediction Prophet Finder - Sophisticated Analysis
 *
 * Pipeline:
 * 1. Fetch tweets from TwitterAPI.io
 * 2. Basic keyword filter
 * 3. FinBERT sentiment analysis (HuggingFace API)
 * 4. Pattern extraction (price targets, timeframes, tickers)
 * 5. Price verification (CoinGecko + Yahoo Finance)
 * 6. Combined scoring
 *
 * Usage: node scripts/find-prediction-prophets.js [options]
 *
 * Requires:
 *   - TWITTER_API_KEY (TwitterAPI.io)
 *   - HUGGINGFACE_API_KEY (optional, for FinBERT)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  // API Keys
  TWITTER_API_KEY: process.env.TWITTER_API_KEY || process.env.VITE_TWITTER_API_KEY,
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY,

  // API Endpoints
  TWITTER_API_BASE: 'https://api.twitterapi.io',
  FINBERT_API: 'https://api-inference.huggingface.co/models/ProsusAI/finbert',
  COINGECKO_API: 'https://api.coingecko.com/api/v3',
  YAHOO_FINANCE_API: 'https://query1.finance.yahoo.com/v8/finance/chart',

  // Rate Limits
  TWITTER_RATE_LIMIT: 5000,    // 5s between Twitter API calls
  FINBERT_RATE_LIMIT: 100,     // 100ms between HuggingFace calls
  PRICE_RATE_LIMIT: 1000,      // 1s between price API calls

  // Limits
  MAX_TWITTER_PAGES: 5,        // Limit to 5 pages (~100 tweets)
  MAX_TWEETS: 100,             // Stop after this many tweets
  MAX_FINBERT_BATCH: 50,       // Analyze top N tweets with FinBERT

  // Keywords for basic filtering
  BEARISH_KEYWORDS: {
    strong: ['dump', 'crash', 'collapse', 'plummet', 'tank', 'meltdown', 'freefall', 'capitulation'],
    medium: ['bearish', 'correction', 'pullback', 'sell', 'short', 'puts', 'drop', 'fall', 'decline', 'red'],
    weak: ['caution', 'warning', 'overvalued', 'bubble', 'risk', 'careful', 'danger', 'top']
  },

  // Asset mappings
  ASSETS: {
    // Crypto - CoinGecko IDs
    crypto: {
      'btc': { id: 'bitcoin', symbol: 'BTC', aliases: ['bitcoin', '$btc'] },
      'eth': { id: 'ethereum', symbol: 'ETH', aliases: ['ethereum', '$eth'] },
      'sol': { id: 'solana', symbol: 'SOL', aliases: ['solana', '$sol'] },
      'xrp': { id: 'ripple', symbol: 'XRP', aliases: ['ripple', '$xrp'] },
      'doge': { id: 'dogecoin', symbol: 'DOGE', aliases: ['dogecoin', '$doge'] },
      'ada': { id: 'cardano', symbol: 'ADA', aliases: ['cardano', '$ada'] },
      'bnb': { id: 'binancecoin', symbol: 'BNB', aliases: ['$bnb'] },
      'avax': { id: 'avalanche-2', symbol: 'AVAX', aliases: ['avalanche', '$avax'] },
    },
    // Stocks - Yahoo Finance symbols
    stocks: {
      'spy': { symbol: 'SPY', aliases: ['$spy', 's&p', 's&p500', 'sp500'] },
      'qqq': { symbol: 'QQQ', aliases: ['$qqq', 'nasdaq', 'tech stocks'] },
      'dia': { symbol: 'DIA', aliases: ['$dia', 'dow', 'djia'] },
      'nvda': { symbol: 'NVDA', aliases: ['nvidia', '$nvda'] },
      'tsla': { symbol: 'TSLA', aliases: ['tesla', '$tsla'] },
      'aapl': { symbol: 'AAPL', aliases: ['apple', '$aapl'] },
      'msft': { symbol: 'MSFT', aliases: ['microsoft', '$msft'] },
      'amzn': { symbol: 'AMZN', aliases: ['amazon', '$amzn'] },
    }
  },

  // Pattern extraction regexes
  PATTERNS: {
    priceTarget: /\$?([\d,]+(?:\.\d+)?)\s*[kK]?(?:\s*(?:target|pt|price|level|support|resistance))?/gi,
    percentDrop: /(\d+(?:\.\d+)?)\s*%\s*(?:drop|fall|crash|down|decline|correction)/gi,
    timeframe: /(?:by|within|in|next)\s*(\d+)\s*(hour|day|week|month|year)s?/gi,
    ticker: /\$([A-Z]{1,5})\b/g,
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function parseArgs() {
  const args = process.argv.slice(2)
  const getArg = (name) => {
    const arg = args.find(a => a.startsWith(`--${name}=`))
    return arg ? arg.split('=')[1] : null
  }

  return {
    days: parseInt(getArg('days')) || 7,
    asset: getArg('asset') || 'all',
    output: getArg('output') || path.join(__dirname, 'output', `prediction-report-${new Date().toISOString().split('T')[0]}.json`),
    skipFinbert: args.includes('--skip-finbert'),
    skipPrices: args.includes('--skip-prices'),
    loadCache: args.includes('--load-cache'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    help: args.includes('--help') || args.includes('-h')
  }
}

function showHelp() {
  console.log(`
Market Prediction Prophet Finder - Sophisticated Analysis
==========================================================

Searches X.com for accounts that predicted market dumps.
Uses FinBERT for sentiment analysis and verifies against actual prices.

Usage: node scripts/find-prediction-prophets.js [options]

Options:
  --days=N         Look back N days (default: 7)
  --asset=TYPE     Filter by asset: crypto, stocks, all (default: all)
  --output=PATH    Output JSON file path
  --load-cache     Use cached tweets instead of fetching new ones
  --skip-finbert   Skip FinBERT sentiment analysis
  --skip-prices    Skip price verification
  --verbose, -v    Show detailed output
  --help, -h       Show this help message

Environment Variables:
  TWITTER_API_KEY      Required - TwitterAPI.io key
  HUGGINGFACE_API_KEY  Optional - For FinBERT analysis (free tier: 1000/day)

Examples:
  node scripts/find-prediction-prophets.js
  node scripts/find-prediction-prophets.js --days=14 --asset=crypto
  node scripts/find-prediction-prophets.js --skip-finbert --skip-prices
`)
}

// ============================================================================
// Twitter API Functions
// ============================================================================

async function searchTweets(query, queryType = 'Latest', cursor = null) {
  const url = new URL(`${CONFIG.TWITTER_API_BASE}/twitter/tweet/advanced_search`)
  url.searchParams.set('query', query)
  url.searchParams.set('queryType', queryType)
  if (cursor) url.searchParams.set('cursor', cursor)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-api-key': CONFIG.TWITTER_API_KEY,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Twitter API Error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

async function fetchTweets(daysBack = 7, verbose = false, outputDir = null) {
  const allTweets = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)
  const dateStr = startDate.toISOString().split('T')[0]

  // Build search query
  const bearishTerms = [...CONFIG.BEARISH_KEYWORDS.strong, ...CONFIG.BEARISH_KEYWORDS.medium].slice(0, 10)
  const cryptoTerms = Object.values(CONFIG.ASSETS.crypto).flatMap(a => [a.symbol.toLowerCase(), ...a.aliases]).slice(0, 8)
  const stockTerms = Object.values(CONFIG.ASSETS.stocks).flatMap(a => [a.symbol.toLowerCase(), ...a.aliases]).slice(0, 8)
  const assetTerms = [...cryptoTerms, ...stockTerms].slice(0, 12)

  // Use until: to get tweets BEFORE today (actual predictions, not post-hoc)
  const untilDate = new Date()
  untilDate.setDate(untilDate.getDate() - 1) // Yesterday
  const untilStr = untilDate.toISOString().split('T')[0]

  const query = `(${bearishTerms.join(' OR ')}) (${assetTerms.join(' OR ')}) since:${dateStr} until:${untilStr} -filter:replies -filter:retweets`

  console.log(`Search query: ${query}`)
  console.log(`Limits: max ${CONFIG.MAX_TWITTER_PAGES} pages, max ${CONFIG.MAX_TWEETS} tweets\n`)

  // Prepare incremental save file
  const cacheFile = outputDir ? path.join(outputDir, 'tweets-cache.json') : null
  if (cacheFile) {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
  }

  let cursor = null
  let page = 0

  do {
    page++
    process.stdout.write(`\rFetching page ${page}/${CONFIG.MAX_TWITTER_PAGES} (${allTweets.length} tweets)...`)

    try {
      const result = await searchTweets(query, 'Latest', cursor)
      const tweets = result.tweets || result.data?.tweets || []

      if (tweets.length === 0 && page === 1) {
        console.log('\n  No tweets found')
        if (verbose) console.log('  Response:', JSON.stringify(result, null, 2).slice(0, 500))
        break
      }

      allTweets.push(...tweets)

      // Save incrementally to prevent data loss
      if (cacheFile) {
        fs.writeFileSync(cacheFile, JSON.stringify({
          fetched_at: new Date().toISOString(),
          query,
          count: allTweets.length,
          tweets: allTweets
        }, null, 2))
      }

      // Check tweet limit
      if (allTweets.length >= CONFIG.MAX_TWEETS) {
        console.log(`\n  Reached tweet limit (${CONFIG.MAX_TWEETS})`)
        break
      }

      cursor = result.has_next_page ? result.next_cursor : null

      if (cursor && page < CONFIG.MAX_TWITTER_PAGES) {
        await delay(CONFIG.TWITTER_RATE_LIMIT)
      }
    } catch (error) {
      console.error(`\n  Error on page ${page}: ${error.message}`)
      break
    }
  } while (cursor && page < CONFIG.MAX_TWITTER_PAGES)

  console.log(`\rFetched ${allTweets.length} tweets from ${page} pages                    `)
  if (cacheFile) console.log(`  Cached to: ${cacheFile}`)
  return allTweets
}

// ============================================================================
// FinBERT Sentiment Analysis
// ============================================================================

async function analyzeWithFinBERT(text) {
  if (!CONFIG.HUGGINGFACE_API_KEY) {
    return null
  }

  try {
    const response = await fetch(CONFIG.FINBERT_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: text.slice(0, 512) }) // FinBERT limit
    })

    if (!response.ok) {
      if (response.status === 503) {
        // Model loading, wait and retry
        await delay(20000)
        return analyzeWithFinBERT(text)
      }
      return null
    }

    const result = await response.json()

    // FinBERT returns: [[{label: "positive", score: 0.9}, {label: "negative", score: 0.05}, ...]]
    if (Array.isArray(result) && Array.isArray(result[0])) {
      const sentiments = result[0]
      const negative = sentiments.find(s => s.label === 'negative')
      const positive = sentiments.find(s => s.label === 'positive')
      const neutral = sentiments.find(s => s.label === 'neutral')

      return {
        negative: negative?.score || 0,
        positive: positive?.score || 0,
        neutral: neutral?.score || 0,
        dominant: sentiments.reduce((a, b) => a.score > b.score ? a : b).label
      }
    }

    return null
  } catch (error) {
    return null
  }
}

async function batchAnalyzeFinBERT(tweets, verbose = false) {
  if (!CONFIG.HUGGINGFACE_API_KEY) {
    console.log('  Skipping FinBERT (no HUGGINGFACE_API_KEY)')
    return tweets.map(t => ({ ...t, finbert: null }))
  }

  console.log(`  Analyzing ${tweets.length} tweets with FinBERT...`)
  const results = []

  for (let i = 0; i < tweets.length; i++) {
    const tweet = tweets[i]
    process.stdout.write(`\r  FinBERT: ${i + 1}/${tweets.length}`)

    const finbert = await analyzeWithFinBERT(tweet.text || '')
    results.push({ ...tweet, finbert })

    if (i < tweets.length - 1) {
      await delay(CONFIG.FINBERT_RATE_LIMIT)
    }
  }

  console.log(`\r  FinBERT: Analyzed ${tweets.length} tweets`)
  return results
}

// ============================================================================
// Price Data Functions
// ============================================================================

// Cache for price data
const priceCache = new Map()

async function getCryptoPriceHistory(coinId, days = 7) {
  const cacheKey = `crypto:${coinId}:${days}`
  if (priceCache.has(cacheKey)) {
    return priceCache.get(cacheKey)
  }

  try {
    const url = `${CONFIG.COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
    const response = await fetch(url)

    if (!response.ok) {
      console.warn(`  CoinGecko error for ${coinId}: ${response.status}`)
      return null
    }

    const data = await response.json()
    const prices = data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp),
      price
    }))

    priceCache.set(cacheKey, prices)
    return prices
  } catch (error) {
    console.warn(`  Error fetching ${coinId}: ${error.message}`)
    return null
  }
}

async function getStockPriceHistory(symbol, days = 7) {
  const cacheKey = `stock:${symbol}:${days}`
  if (priceCache.has(cacheKey)) {
    return priceCache.get(cacheKey)
  }

  try {
    const period1 = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000)
    const period2 = Math.floor(Date.now() / 1000)
    const url = `${CONFIG.YAHOO_FINANCE_API}/${symbol}?period1=${period1}&period2=${period2}&interval=1d`

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    if (!response.ok) {
      console.warn(`  Yahoo Finance error for ${symbol}: ${response.status}`)
      return null
    }

    const data = await response.json()
    const result = data.chart?.result?.[0]

    if (!result?.timestamp || !result?.indicators?.quote?.[0]?.close) {
      return null
    }

    const prices = result.timestamp.map((ts, i) => ({
      date: new Date(ts * 1000),
      price: result.indicators.quote[0].close[i]
    })).filter(p => p.price !== null)

    priceCache.set(cacheKey, prices)
    return prices
  } catch (error) {
    console.warn(`  Error fetching ${symbol}: ${error.message}`)
    return null
  }
}

async function fetchAllPriceData(days = 7, verbose = false) {
  console.log('  Fetching price data...')
  const priceData = { crypto: {}, stocks: {} }

  // Fetch crypto prices
  for (const [key, asset] of Object.entries(CONFIG.ASSETS.crypto)) {
    process.stdout.write(`\r  Prices: ${asset.symbol}...`)
    priceData.crypto[key] = await getCryptoPriceHistory(asset.id, days + 1)
    await delay(CONFIG.PRICE_RATE_LIMIT)
  }

  // Fetch stock prices
  for (const [key, asset] of Object.entries(CONFIG.ASSETS.stocks)) {
    process.stdout.write(`\r  Prices: ${asset.symbol}...`)
    priceData.stocks[key] = await getStockPriceHistory(asset.symbol, days + 1)
    await delay(CONFIG.PRICE_RATE_LIMIT)
  }

  console.log('\r  Prices: Fetched all price data    ')
  return priceData
}

function calculatePriceChange(prices, fromDate, toDate = new Date()) {
  if (!prices || prices.length < 2) return null

  const fromTime = new Date(fromDate).getTime()
  const toTime = new Date(toDate).getTime()

  // Find closest prices to dates
  const fromPrice = prices.reduce((closest, p) => {
    const diff = Math.abs(p.date.getTime() - fromTime)
    const closestDiff = Math.abs(closest.date.getTime() - fromTime)
    return diff < closestDiff ? p : closest
  })

  const toPrice = prices.reduce((closest, p) => {
    const diff = Math.abs(p.date.getTime() - toTime)
    const closestDiff = Math.abs(closest.date.getTime() - toTime)
    return diff < closestDiff ? p : closest
  })

  if (!fromPrice?.price || !toPrice?.price) return null

  const change = ((toPrice.price - fromPrice.price) / fromPrice.price) * 100
  return {
    fromPrice: fromPrice.price,
    toPrice: toPrice.price,
    changePercent: Math.round(change * 100) / 100,
    direction: change < 0 ? 'down' : change > 0 ? 'up' : 'flat'
  }
}

// ============================================================================
// Pattern Extraction
// ============================================================================

function extractPatterns(text) {
  const lowerText = text.toLowerCase()
  const patterns = {
    tickers: [],
    priceTargets: [],
    percentDrops: [],
    timeframes: [],
    assets: { crypto: [], stocks: [] }
  }

  // Extract $TICKER mentions
  const tickerMatches = text.matchAll(CONFIG.PATTERNS.ticker)
  for (const match of tickerMatches) {
    patterns.tickers.push(match[1].toUpperCase())
  }

  // Extract price targets
  const priceMatches = text.matchAll(CONFIG.PATTERNS.priceTarget)
  for (const match of priceMatches) {
    const value = parseFloat(match[1].replace(/,/g, ''))
    if (value > 0 && value < 1000000) {
      patterns.priceTargets.push(value)
    }
  }

  // Extract percent drop predictions
  const percentMatches = text.matchAll(CONFIG.PATTERNS.percentDrop)
  for (const match of percentMatches) {
    patterns.percentDrops.push(parseFloat(match[1]))
  }

  // Extract timeframes
  const timeMatches = text.matchAll(CONFIG.PATTERNS.timeframe)
  for (const match of timeMatches) {
    patterns.timeframes.push({
      value: parseInt(match[1]),
      unit: match[2].toLowerCase()
    })
  }

  // Detect mentioned assets
  for (const [key, asset] of Object.entries(CONFIG.ASSETS.crypto)) {
    const allTerms = [asset.symbol.toLowerCase(), ...asset.aliases]
    if (allTerms.some(term => lowerText.includes(term))) {
      patterns.assets.crypto.push(key)
    }
  }

  for (const [key, asset] of Object.entries(CONFIG.ASSETS.stocks)) {
    const allTerms = [asset.symbol.toLowerCase(), ...asset.aliases]
    if (allTerms.some(term => lowerText.includes(term))) {
      patterns.assets.stocks.push(key)
    }
  }

  return patterns
}

// ============================================================================
// Scoring Functions
// ============================================================================

function calculateKeywordScore(text) {
  const lowerText = text.toLowerCase()
  let score = 0

  for (const keyword of CONFIG.BEARISH_KEYWORDS.strong) {
    if (lowerText.includes(keyword)) score += 3
  }
  for (const keyword of CONFIG.BEARISH_KEYWORDS.medium) {
    if (lowerText.includes(keyword)) score += 2
  }
  for (const keyword of CONFIG.BEARISH_KEYWORDS.weak) {
    if (lowerText.includes(keyword)) score += 1
  }

  return Math.min(score, 10)
}

function calculateSpecificityScore(patterns) {
  let score = 0

  // Specific tickers mentioned
  if (patterns.tickers.length > 0) score += 2

  // Price targets given
  if (patterns.priceTargets.length > 0) score += 3

  // Percent predictions
  if (patterns.percentDrops.length > 0) score += 2

  // Timeframe given
  if (patterns.timeframes.length > 0) score += 2

  // Multiple assets = more specific
  const totalAssets = patterns.assets.crypto.length + patterns.assets.stocks.length
  if (totalAssets >= 2) score += 1

  return Math.min(score, 10)
}

function calculateAccuracyScore(patterns, priceData, tweetDate) {
  if (!priceData) return { score: 0, details: [] }

  const details = []
  let totalAccuracy = 0
  let checkedAssets = 0

  // Check crypto predictions
  // For daily data: check if price dropped from PERIOD START to NOW
  // (not from tweet time, as daily data lacks granularity)
  for (const cryptoKey of patterns.assets.crypto) {
    const prices = priceData.crypto[cryptoKey]
    if (!prices || prices.length < 2) continue

    // Use period start to now for accuracy (daily data limitation)
    const priceChange = calculatePriceChange(prices, prices[0].date, new Date())
    if (priceChange) {
      checkedAssets++
      // Bearish prediction was correct if price went down
      const wasCorrect = priceChange.direction === 'down'
      // Score based on magnitude of drop (bigger drop = more accurate if predicted)
      const accuracy = wasCorrect ? Math.min(Math.abs(priceChange.changePercent) / 10, 1) : 0
      totalAccuracy += accuracy

      details.push({
        asset: CONFIG.ASSETS.crypto[cryptoKey].symbol,
        type: 'crypto',
        change: priceChange.changePercent,
        direction: priceChange.direction,
        correct: wasCorrect
      })
    }
  }

  // Check stock predictions
  for (const stockKey of patterns.assets.stocks) {
    const prices = priceData.stocks[stockKey]
    if (!prices || prices.length < 2) continue

    const priceChange = calculatePriceChange(prices, prices[0].date, new Date())
    if (priceChange) {
      checkedAssets++
      const wasCorrect = priceChange.direction === 'down'
      const accuracy = wasCorrect ? Math.min(Math.abs(priceChange.changePercent) / 10, 1) : 0
      totalAccuracy += accuracy

      details.push({
        asset: CONFIG.ASSETS.stocks[stockKey].symbol,
        type: 'stock',
        change: priceChange.changePercent,
        direction: priceChange.direction,
        correct: wasCorrect
      })
    }
  }

  const score = checkedAssets > 0 ? (totalAccuracy / checkedAssets) * 10 : 0

  return {
    score: Math.round(score * 100) / 100,
    details,
    checkedAssets,
    correctPredictions: details.filter(d => d.correct).length
  }
}

function calculateFinalScore(tweet, priceData) {
  const text = tweet.text || ''
  const patterns = extractPatterns(text)
  const tweetDate = new Date(tweet.createdAt || tweet.created_at)

  // Component scores (0-10 each)
  const keywordScore = calculateKeywordScore(text)
  const specificityScore = calculateSpecificityScore(patterns)
  const accuracyResult = calculateAccuracyScore(patterns, priceData, tweetDate)

  // FinBERT sentiment score (0-10)
  let sentimentScore = 5 // neutral default
  if (tweet.finbert) {
    // Higher negative sentiment = higher score for bearish prediction
    sentimentScore = tweet.finbert.negative * 10
  }

  // Engagement factor (logarithmic)
  const engagement = (tweet.likeCount || 0) + (tweet.retweetCount || 0)
  const engagementFactor = Math.log10(engagement + 1) / 2 // 0-2 range

  // Weighted final score
  const weights = {
    keyword: 0.15,
    sentiment: 0.25,
    specificity: 0.20,
    accuracy: 0.40
  }

  const baseScore = (
    keywordScore * weights.keyword +
    sentimentScore * weights.sentiment +
    specificityScore * weights.specificity +
    accuracyResult.score * weights.accuracy
  )

  // Apply engagement multiplier (1.0 to 2.0)
  const finalScore = baseScore * (1 + engagementFactor * 0.5)

  return {
    finalScore: Math.round(finalScore * 100) / 100,
    components: {
      keyword: keywordScore,
      sentiment: sentimentScore,
      specificity: specificityScore,
      accuracy: accuracyResult.score
    },
    patterns,
    accuracyDetails: accuracyResult.details,
    engagement,
    finbert: tweet.finbert
  }
}

// ============================================================================
// Aggregation Functions
// ============================================================================

function analyzeTweets(tweets, priceData) {
  return tweets.map(tweet => {
    const analysis = calculateFinalScore(tweet, priceData)
    return {
      ...tweet,
      analysis
    }
  }).filter(t => t.analysis.finalScore >= 2) // Minimum threshold
}

function aggregateByAccount(analyzedTweets, minFollowers = 10000, langFilter = 'en') {
  const accounts = new Map()

  for (const tweet of analyzedTweets) {
    const author = tweet.author || {}
    const username = author.userName || author.username || 'unknown'
    const followers = author.followers || author.followersCount || 0

    // Skip accounts with less than minimum followers
    if (followers < minFollowers) continue

    // Skip non-English tweets if filter is set
    if (langFilter && tweet.lang !== langFilter) continue

    if (!accounts.has(username)) {
      accounts.set(username, {
        username,
        displayName: author.name || author.displayName || username,
        followers,
        isVerified: author.isBlueVerified || author.verified || false,
        profileUrl: `https://x.com/${username}`,
        predictions: []
      })
    }

    accounts.get(username).predictions.push({
      tweetId: tweet.id,
      tweetUrl: tweet.url || `https://x.com/${username}/status/${tweet.id}`,
      text: tweet.text,
      predictedAt: tweet.createdAt || tweet.created_at,
      engagement: {
        likes: tweet.likeCount || 0,
        retweets: tweet.retweetCount || 0,
        replies: tweet.replyCount || 0,
        views: tweet.viewCount || 0
      },
      analysis: tweet.analysis
    })
  }

  return accounts
}

function calculateAccountStats(account) {
  const predictions = account.predictions

  // Average scores across predictions
  const avgFinalScore = predictions.reduce((sum, p) => sum + p.analysis.finalScore, 0) / predictions.length
  const avgAccuracy = predictions.reduce((sum, p) => sum + p.analysis.components.accuracy, 0) / predictions.length
  const avgSentiment = predictions.reduce((sum, p) => sum + p.analysis.components.sentiment, 0) / predictions.length
  const avgSpecificity = predictions.reduce((sum, p) => sum + p.analysis.components.specificity, 0) / predictions.length

  // Total engagement
  const totalEngagement = predictions.reduce((sum, p) =>
    sum + p.engagement.likes + p.engagement.retweets, 0)

  // Correct predictions count
  const correctPredictions = predictions.reduce((sum, p) =>
    sum + (p.analysis.accuracyDetails?.filter(d => d.correct).length || 0), 0)
  const totalChecked = predictions.reduce((sum, p) =>
    sum + (p.analysis.accuracyDetails?.length || 0), 0)

  // Final account score - weighted by prediction count and follower reach
  const predictionBonus = Math.log10(predictions.length + 1)
  const reachBonus = Math.log10(account.followers + 1) / 5
  const accountScore = avgFinalScore * (1 + predictionBonus * 0.2) * (1 + reachBonus * 0.1)

  return {
    predictionCount: predictions.length,
    avgFinalScore: Math.round(avgFinalScore * 100) / 100,
    avgAccuracy: Math.round(avgAccuracy * 100) / 100,
    avgSentiment: Math.round(avgSentiment * 100) / 100,
    avgSpecificity: Math.round(avgSpecificity * 100) / 100,
    totalEngagement,
    correctPredictions,
    totalChecked,
    accuracyRate: totalChecked > 0 ? Math.round((correctPredictions / totalChecked) * 100) : 0,
    accountScore: Math.round(accountScore * 100) / 100
  }
}

function rankAccounts(accounts, assetFilter = 'all') {
  let rankedAccounts = [...accounts.values()]
    .map(account => ({
      ...account,
      stats: calculateAccountStats(account)
    }))
    .sort((a, b) => b.stats.accountScore - a.stats.accountScore)

  // Filter by asset type if specified
  if (assetFilter !== 'all') {
    rankedAccounts = rankedAccounts.filter(account =>
      account.predictions.some(p => {
        const assets = p.analysis.patterns?.assets || { crypto: [], stocks: [] }
        if (assetFilter === 'crypto') return assets.crypto.length > 0
        if (assetFilter === 'stocks') return assets.stocks.length > 0
        return true
      })
    )
  }

  return rankedAccounts
}

// ============================================================================
// Output Functions
// ============================================================================

function generateCLIReport(rankedAccounts, daysBack, priceData) {
  console.log('\n' + '='.repeat(80))
  console.log('  MARKET PREDICTION PROPHETS - SOPHISTICATED ANALYSIS REPORT')
  console.log(`  Analysis Period: Last ${daysBack} days`)
  console.log(`  Generated: ${new Date().toISOString()}`)
  console.log('='.repeat(80))

  // Price summary
  console.log('\n--- MARKET SUMMARY ---')
  for (const [key, prices] of Object.entries(priceData?.crypto || {})) {
    if (prices && prices.length >= 2) {
      const change = calculatePriceChange(prices, prices[0].date, new Date())
      if (change) {
        const symbol = CONFIG.ASSETS.crypto[key]?.symbol || key.toUpperCase()
        const arrow = change.direction === 'down' ? '▼' : change.direction === 'up' ? '▲' : '─'
        console.log(`  ${symbol}: ${arrow} ${change.changePercent}%`)
      }
    }
  }
  for (const [key, prices] of Object.entries(priceData?.stocks || {})) {
    if (prices && prices.length >= 2) {
      const change = calculatePriceChange(prices, prices[0].date, new Date())
      if (change) {
        const symbol = CONFIG.ASSETS.stocks[key]?.symbol || key.toUpperCase()
        const arrow = change.direction === 'down' ? '▼' : change.direction === 'up' ? '▲' : '─'
        console.log(`  ${symbol}: ${arrow} ${change.changePercent}%`)
      }
    }
  }

  if (rankedAccounts.length === 0) {
    console.log('\nNo prediction accounts found matching criteria.\n')
    return
  }

  console.log(`\n--- TOP 20 PREDICTION PROPHETS ---`)
  console.log(`Found ${rankedAccounts.length} accounts with valid predictions.\n`)

  rankedAccounts.slice(0, 20).forEach((account, index) => {
    const verified = account.isVerified ? ' ✓' : ''
    const rank = String(index + 1).padStart(2, ' ')
    const stats = account.stats

    console.log(`${rank}. @${account.username}${verified}`)
    console.log(`    Followers: ${account.followers.toLocaleString()} | Predictions: ${stats.predictionCount}`)
    console.log(`    Score: ${stats.accountScore} | Accuracy: ${stats.accuracyRate}% (${stats.correctPredictions}/${stats.totalChecked})`)
    console.log(`    Sentiment: ${stats.avgSentiment}/10 | Specificity: ${stats.avgSpecificity}/10`)

    // Show best prediction
    if (account.predictions.length > 0) {
      const best = account.predictions.sort((a, b) => b.analysis.finalScore - a.analysis.finalScore)[0]
      const snippet = best.text.slice(0, 80).replace(/\n/g, ' ')
      console.log(`    Best: "${snippet}..."`)

      if (best.analysis.accuracyDetails?.length > 0) {
        const details = best.analysis.accuracyDetails.slice(0, 3).map(d =>
          `${d.asset} ${d.correct ? '✓' : '✗'} ${d.change}%`
        ).join(', ')
        console.log(`    Results: ${details}`)
      }
    }
    console.log(`    ${account.profileUrl}`)
    console.log('')
  })

  console.log('='.repeat(80))
  console.log(`Total accounts analyzed: ${rankedAccounts.length}`)
  console.log('='.repeat(80))
}

function saveJSONReport(rankedAccounts, outputPath, daysBack, priceData) {
  const report = {
    generated_at: new Date().toISOString(),
    analysis_period: {
      days_back: daysBack,
      start: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    },
    methodology: {
      scoring_weights: {
        keyword: 0.15,
        sentiment: 0.25,
        specificity: 0.20,
        accuracy: 0.40
      },
      sentiment_model: 'ProsusAI/finbert',
      price_sources: ['CoinGecko', 'Yahoo Finance']
    },
    market_summary: {
      crypto: Object.entries(priceData?.crypto || {}).reduce((acc, [key, prices]) => {
        if (prices && prices.length >= 2) {
          const change = calculatePriceChange(prices, prices[0].date, new Date())
          if (change) acc[CONFIG.ASSETS.crypto[key]?.symbol || key] = change
        }
        return acc
      }, {}),
      stocks: Object.entries(priceData?.stocks || {}).reduce((acc, [key, prices]) => {
        if (prices && prices.length >= 2) {
          const change = calculatePriceChange(prices, prices[0].date, new Date())
          if (change) acc[CONFIG.ASSETS.stocks[key]?.symbol || key] = change
        }
        return acc
      }, {})
    },
    summary: {
      total_accounts: rankedAccounts.length,
      total_predictions: rankedAccounts.reduce((sum, a) => sum + a.stats.predictionCount, 0),
      avg_accuracy_rate: rankedAccounts.length > 0
        ? Math.round(rankedAccounts.reduce((sum, a) => sum + a.stats.accuracyRate, 0) / rankedAccounts.length)
        : 0
    },
    top_predictors: rankedAccounts.slice(0, 50)
  }

  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8')
  console.log(`\nJSON report saved to: ${outputPath}`)
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  const args = parseArgs()

  if (args.help) {
    showHelp()
    process.exit(0)
  }

  console.log('╔══════════════════════════════════════════════════════════════════════╗')
  console.log('║  MARKET PREDICTION PROPHET FINDER - Sophisticated Analysis          ║')
  console.log('╚══════════════════════════════════════════════════════════════════════╝')
  console.log(`\nConfiguration:`)
  console.log(`  Days: ${args.days}`)
  console.log(`  Asset filter: ${args.asset}`)
  console.log(`  FinBERT: ${args.skipFinbert ? 'Disabled' : (CONFIG.HUGGINGFACE_API_KEY ? 'Enabled' : 'No API key')}`)
  console.log(`  Price verification: ${args.skipPrices ? 'Disabled' : 'Enabled'}`)

  if (!CONFIG.TWITTER_API_KEY && !args.loadCache) {
    console.error('\nError: TWITTER_API_KEY environment variable required (or use --load-cache)')
    process.exit(1)
  }

  try {
    // Step 1: Fetch tweets (or load from cache)
    console.log('\n━━━ Step 1: Fetching Tweets ━━━')
    const outputDir = path.dirname(args.output)
    let tweets = []

    if (args.loadCache) {
      const cacheFile = path.join(outputDir, 'tweets-cache.json')
      if (fs.existsSync(cacheFile)) {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
        tweets = cached.tweets || []
        console.log(`  Loaded ${tweets.length} tweets from cache`)
        console.log(`  Cached at: ${cached.fetched_at}`)
      } else {
        console.log('  No cache file found, fetching fresh data...')
        tweets = await fetchTweets(args.days, args.verbose, outputDir)
      }
    } else {
      tweets = await fetchTweets(args.days, args.verbose, outputDir)
    }

    if (tweets.length === 0) {
      console.log('\nNo tweets found. Check API key or search parameters.')
      process.exit(0)
    }

    // Step 2: FinBERT sentiment analysis
    console.log('\n━━━ Step 2: Sentiment Analysis ━━━')
    let analyzedTweets = tweets
    if (!args.skipFinbert && CONFIG.HUGGINGFACE_API_KEY) {
      // Analyze top tweets by engagement first
      const topTweets = [...tweets]
        .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
        .slice(0, CONFIG.MAX_FINBERT_BATCH)
      analyzedTweets = await batchAnalyzeFinBERT(topTweets, args.verbose)
    } else {
      console.log('  Skipped FinBERT analysis')
      analyzedTweets = tweets.map(t => ({ ...t, finbert: null }))
    }

    // Step 3: Fetch price data
    console.log('\n━━━ Step 3: Price Verification ━━━')
    let priceData = { crypto: {}, stocks: {} }
    if (!args.skipPrices) {
      priceData = await fetchAllPriceData(args.days, args.verbose)
    } else {
      console.log('  Skipped price verification')
    }

    // Step 4: Score and analyze
    console.log('\n━━━ Step 4: Scoring Predictions ━━━')
    const scoredTweets = analyzeTweets(analyzedTweets, priceData)
    console.log(`  Scored ${scoredTweets.length} valid predictions`)

    // Step 5: Aggregate by account
    console.log('\n━━━ Step 5: Ranking Accounts ━━━')
    const accounts = aggregateByAccount(scoredTweets)
    const rankedAccounts = rankAccounts(accounts, args.asset)
    console.log(`  Ranked ${rankedAccounts.length} accounts`)

    // Step 6: Generate reports
    console.log('\n━━━ Step 6: Generating Reports ━━━')
    generateCLIReport(rankedAccounts, args.days, priceData)
    saveJSONReport(rankedAccounts, args.output, args.days, priceData)

    console.log('\n✓ Analysis complete!')

  } catch (error) {
    console.error('\nFatal error:', error.message)
    if (args.verbose) console.error(error.stack)
    process.exit(1)
  }
}

main()
