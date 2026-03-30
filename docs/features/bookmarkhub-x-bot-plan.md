# BookmarkHub X Reply Bot — Implementation Plan

## Overview

A 24/7 automated bot that monitors X/Twitter for people frustrated with X's native
bookmark system and replies with helpful, human-sounding mentions of BookmarkHub.

**Stack:** OpenClaw (Railway) + aisa.one (X API) + OpenRouter (LLM) + Slack (control UI)

**Estimated cost:** ~$7–11/month total

---

## Services Required

| Service | Purpose | Cost | Signup |
|---|---|---|---|
| Railway | Hosts OpenClaw 24/7 | ~$5/mo (Hobby plan) | railway.com |
| OpenClaw | AI agent runtime | Free (open source) | openclaw.ai |
| aisa.one | X search + posting | ~$1–3/mo pay-per-use | aisa.one |
| OpenRouter | LLM for reply drafting | <$0.01/mo at this volume | openrouter.ai |
| Slack | Control UI / approval flow | Free (create own workspace) | slack.com |

---

## Step 1 — Deploy OpenClaw on Railway

1. Go to: `https://railway.com/deploy/openclaw`
2. Click **Deploy Now**
3. Set the required variable: `SETUP_PASSWORD=your-chosen-password`
4. Wait ~3–5 minutes for deployment
5. Open your Railway URL → you'll be redirected to `/setup` automatically
6. In the setup wizard:
   - Choose **OpenRouter** as your AI provider
   - Paste your OpenRouter API key
   - Set model to: `meta-llama/llama-3.3-70b-instruct:free` (for testing)
   - Connect **Slack** as your channel (paste Bot Token + App Token)
7. A Railway **Volume** is created automatically for persistent storage — config
   survives redeploys

---

## Step 2 — Set Environment Variables in Railway

In Railway dashboard → your OpenClaw service → **Variables** tab, add:

```
AISA_API_KEY=your_key_from_aisa.one
OPENROUTER_API_KEY=sk-or-your-openrouter-key
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_APP_TOKEN=xapp-your-slack-app-token
SETUP_PASSWORD=your-chosen-password
```

OpenClaw reads these automatically. The aisa skill looks for `AISA_API_KEY` by name.

---

## Step 3 — Set Up Slack Workspace

1. Create a free Slack workspace at `slack.com` (or use an existing one)
2. Create a channel called `#bookmarkhub-bot`
3. Go to `api.slack.com/apps` → **Create New App** → From scratch
4. Under **Settings → Socket Mode**: toggle ON → generates `xapp-...` token (App Token)
5. Under **OAuth & Permissions → Bot Token Scopes**, add:
   - `chat:write`, `channels:read`, `channels:history`
   - `im:read`, `im:history`, `reactions:read`, `reactions:write`
6. Click **Install to Workspace** → copy the `xoxb-...` token (Bot Token)
7. Under **Event Subscriptions**: enable and subscribe to `message.channels`,
   `app_mention`, `reaction_added`
8. Paste both tokens into Railway Variables (see Step 2)

---

## Step 4 — Install the aisa-twitter-api Skill

Send this message to your OpenClaw bot via Slack:

```
clawhub install aisa-twitter-api
```

Then verify it installed:

```
List my installed skills
```

---

## Step 5 — Log In to X via aisa (one-time)

Send this to OpenClaw (replace with your actual X account credentials — use the
account you want the bot to post from, e.g. your @BookmarkHub account):

```
Use aisa-twitter-api to login with:
username: YOUR_X_USERNAME
email: YOUR_X_EMAIL
password: YOUR_X_PASSWORD
```

Verify it worked:

```
Use aisa-twitter-api to get my X account details for username: YOUR_X_USERNAME
```

---

## Step 6 — Set Agent Identity (System Prompt)

In OpenClaw `/setup` → **Agent Identity**, paste:

```
You are a BookmarkHub promotion assistant. BookmarkHub is a Chrome extension 
and web app that fixes X/Twitter's broken bookmark system by adding folders, 
full-text search, tags, bulk export, and cross-device sync.

Your job:
- Monitor X for people frustrated with X's native bookmarks
- Draft helpful, human-sounding replies that mention BookmarkHub
- NEVER sound spammy or like an ad
- Always ask for approval before posting
- Remember who you've already replied to

Key selling points vs X bookmarks:
- Folders & collections (X has none)
- Full-text search across all saved tweets
- Bulk export (CSV/JSON)
- Tags
- Works across devices
- Clean web dashboard at bookmarkhub.app

Tone: friendly, empathetic, helpful. Like a developer who solved the same 
problem themselves.
```

---

## Step 7 — Create the Monitoring Job

Send this entire message to OpenClaw via Slack to create the recurring job:

```
Create a recurring job called "BookmarkHub X Monitor" that runs every 20 minutes:

TOOLS AVAILABLE:
- For X search and posting: use the aisa-twitter-api skill (AISA_API_KEY is set)
- For reply drafting: use your LLM (OpenRouter)
- For approval flow: post to Slack channel #bookmarkhub-bot

SEARCH:
Use aisa-twitter-api to search for recent tweets matching:
("X bookmarks" OR "twitter bookmarks") AND 
("suck" OR "broken" OR "useless" OR "hate" OR "disappointed" OR 
"wish" OR "need folders" OR "can't find" OR "so bad" OR "annoying" OR "no search")
Search params: filter:replies excluded, lang:en, queryType:Latest

FILTER (skip tweet if any of these are true):
- Already replied to this tweet ID (check memory)
- It's a retweet or quote tweet
- Account has under 50 followers
- Tweet is older than 2 hours
- Tweet is not genuinely about X's native bookmark feature being bad

DRAFT REPLY:
For each tweet that passes the filter, draft a short reply:
- Under 240 characters
- No hashtags
- Don't start with "Hey" or "Hi"  
- Don't mention price
- Sound like a human, not an ad
- Match tone to the tweet's mood (frustrated = empathetic, casual = casual)

Use these as style reference:

Style 1 - Empathetic:
"Same frustration here — ended up building BookmarkHub because of it. 
Folders, search, export, all the stuff X should have. 
Free to try: bookmarkhub.app"

Style 2 - Direct:
"BookmarkHub fixes exactly this — folders, tags, and full-text search 
across all your saved tweets. bookmarkhub.app"

Style 3 - Casual:
"I got so tired of this I made an app for it lol 
BookmarkHub gives you folders and actual search. 
bookmarkhub.app if you want to try it"

Style 4 - Feature-specific (when they mention a specific problem like "can't find"):
"The search in X bookmarks is genuinely useless. BookmarkHub has 
full-text search across everything you've saved — bookmarkhub.app"

NEVER write:
- "Check out my app!"
- "You should try..."
- Anything that sounds like a sales pitch opener
- Multiple emojis

APPROVAL FLOW:
Post the draft to Slack #bookmarkhub-bot in this exact format:
---
🔖 NEW REPLY DRAFT
Tweet: [link to tweet]
"[original tweet text]"

Draft reply:
"[your drafted reply]"

React ✅ to approve and post, ❌ to skip.
---
Wait for a ✅ reaction before posting. If ❌, skip and save tweet ID to memory anyway.

MEMORY:
After posting, save the tweet ID and author handle to memory.
Never reply to the same tweet ID or same author twice in 7 days.

SAFETY:
Max 15 approved replies per day. If limit is reached, stop and notify me in 
#bookmarkhub-bot.
```

---

## Step 8 — Dry Run

Before the job runs automatically, test it manually:

```
Run BookmarkHub X Monitor once right now, but don't post anything — 
just show me what tweets you found and the reply drafts.
```

Review the output. If the reply quality is good, you're ready to go live.
If you want to tune the tone, adjust the style examples in the job and re-send.

---

## Step 9 — Switch to Production Model

Once happy with reply quality, update the model in OpenClaw `/setup`:

**Testing (free):**
```
openrouter/meta-llama/llama-3.3-70b-instruct:free
```

**Production (fast, cheap):**
```
openrouter/google/gemini-flash-1.5
```

Gemini Flash costs ~$0.25/$1.50 per million tokens. At 15 replies/day this is
effectively $0.00/month — aisa.one API calls will cost more than the LLM.

---

## Step 10 — Go Fully Automatic (optional, after 1–2 weeks)

Once you trust the reply quality, remove the approval step:

```
Update BookmarkHub X Monitor: switch to auto-post mode. 
Skip the Slack approval step — post automatically when a tweet passes all filters.
Still notify me in #bookmarkhub-bot after each post so I can monitor.
Still respect the 15/day limit.
```

---

## Full Architecture

```
Every 20 minutes
      │
      ▼
OpenClaw on Railway (Node.js, persistent volume)
      │
      ├─ aisa-twitter-api ──► searches X for bookmark complaints
      │        │
      │        ▼
      │   found tweets → filtered by rules
      │        │
      ├─ OpenRouter (Gemini Flash / Llama free) ──► drafts reply
      │        │
      │        ▼
      │   draft reply (under 240 chars)
      │        │
      ├─ Slack #bookmarkhub-bot ──► shows draft, waits for ✅
      │        │
      │     you react ✅
      │        │
      └─ aisa-twitter-api ──► posts reply from your @BookmarkHub X account
               │
               ▼
         tweet ID saved to memory → never reply twice
```

---

## Pre-Launch Checklist

- [ ] OpenClaw deployed on Railway (one-click template)
- [ ] `AISA_API_KEY` set in Railway Variables
- [ ] `OPENROUTER_API_KEY` set in Railway Variables
- [ ] `SLACK_BOT_TOKEN` and `SLACK_APP_TOKEN` set in Railway Variables
- [ ] Slack workspace created, `#bookmarkhub-bot` channel exists
- [ ] Slack app created at api.slack.com, Socket Mode enabled
- [ ] `clawhub install aisa-twitter-api` sent to OpenClaw
- [ ] X account authenticated via aisa (one-time login command)
- [ ] OpenRouter model set in `/setup`
- [ ] System prompt (Agent Identity) pasted into `/setup`
- [ ] Job prompt sent to OpenClaw to create the recurring job
- [ ] Dry run completed and reply quality reviewed
- [ ] bookmarkhub.app URL confirmed working in replies

---

## X Account Notes

- Post from a **dedicated @BookmarkHub account** (cleaner than personal)
- Make sure the account has a profile pic, bio, and a few existing tweets
  before the bot starts replying — brand-new blank accounts get shadowbanned
- Start with the approval loop for at least 1 week before going auto
- Keep volume low (15/day max) — X flags accounts that reply-spam at scale
- Replies should be genuinely helpful, not pure promotion

---

## Estimated Monthly Cost at 15 replies/day

| Service | Cost |
|---|---|
| Railway Hobby plan | $5.00 |
| aisa.one (searches + posts) | ~$1–2 |
| OpenRouter (Gemini Flash) | <$0.01 |
| Slack | Free |
| **Total** | **~$7/month** |
