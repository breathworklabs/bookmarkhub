# BookmarkHub Launch Copy

All copy ready to copy-paste for launch day. Adjust URLs and handles before posting.

---

## Product Hunt

### Tagline
Organize your X/Twitter bookmarks — privately, instantly, offline-first.

### Description
BookmarkHub is a Chrome extension + web app that finally fixes X's broken bookmark system.

**The problem:** X bookmarks are a black hole. You save something important, it's gone forever. No search, no folders, no way to find it again.

**The fix:**
- 🔖 One-click import of ALL your existing X bookmarks
- 📁 Unlimited collections and smart tags (with NLP auto-suggestions)
- 🔍 Full-text search + advanced filters (by author, date, media type)
- 🔒 100% local storage — your data never leaves your device
- 📤 Share curated collections with a public link
- 📦 Export everything as JSON anytime

No account needed. No subscription. No tracking. Just your bookmarks, organized.

**Why I built it:** I had 3,000+ bookmarks in X with zero way to find anything. Built the tool I wished existed. It's been running in production for months — 99% test coverage, Chrome extension in the Web Store.

### First Comment (Maker)
Hey PH! 👋

I'm Bart, the builder behind BookmarkHub.

The idea started from pure frustration: I'd save great threads, research, and resources to X bookmarks, then never find them again. X's native bookmark feature has no search, no organization, nothing.

So I built BookmarkHub — a Chrome extension that imports all your existing bookmarks in one click, then gives you a proper manager (collections, tags, full-text search) that works completely offline.

The privacy angle matters a lot to me. All your bookmarks stay in your browser's localStorage. No server, no account, no data harvesting. You can export everything as JSON and take it anywhere.

Would love your feedback, especially on the sharing feature (just shipped last month — you can now share curated collections with a public link).

What would make this a 10/10 for you?

### Reply Templates

**"Does this require an account?"**
> Nope! No account, no sign-up. Everything runs in your browser — your bookmarks never touch a server. That's a core design choice.

**"Does it work with the free Twitter/X tier?"**
> Yes — the Chrome extension works regardless of X subscription tier. It imports directly from the page.

**"Will X ban me for using this?"**
> BookmarkHub reads from your existing bookmarks page — the same thing you'd do manually. It doesn't use undocumented APIs or automate actions on X.

---

## Reddit Posts

### r/productivity

**Title:** I built a free tool to fix X/Twitter's broken bookmark system — 100% local storage, no account needed

**Body:**
Long-time lurker, first post with something I actually built.

**The problem:** X/Twitter bookmarks are useless for anyone who saves more than 50 things. No folders, no search, no way to find that thread you saved 3 months ago.

**What I built:** BookmarkHub — a Chrome extension + web app that:
- Imports ALL your X bookmarks in one click
- Lets you organize into collections + tags (with smart auto-suggestions)
- Full-text search across everything
- Filters by author, date, media type, and more
- 100% local storage — nothing leaves your browser
- Share collections with public links

It's free, open, no account needed. Been running it myself for months with ~3,000 bookmarks.

Link: bookmarkhub.app | Chrome extension in the Web Store

Happy to answer any questions. Would love feedback from productivity folks on what features matter most.

---

### r/Twitter (or r/x)

**Title:** Tired of losing saved tweets? I built a bookmark manager that actually works

**Body:**
X bookmarks have one job and they fail at it. Save something → can't find it later.

I got frustrated and spent a few months building a fix:

**BookmarkHub** — imports all your existing X bookmarks via a Chrome extension, then gives you:
- Collections (think folders)
- Tags with AI auto-suggestions
- Full-text search
- Filters by date, author, media type
- Share collections via public links
- Export as JSON

Everything stored locally in your browser. No account. No server. No tracking.

Check it out at bookmarkhub.app — Chrome extension is on the Web Store.

---

### r/selfhosted

**Title:** BookmarkHub — privacy-first X/Twitter bookmark manager, 100% local-first, no backend required

**Body:**
Built this for myself after getting fed up with X's bookmark system.

**BookmarkHub** is a React/TypeScript web app + Chrome extension that keeps all data in browser localStorage. No backend, no accounts, no cloud sync by default.

Tech stack: React 18, TypeScript, Chakra UI, Zustand, Vite. Chrome extension uses Manifest V3.

**Self-hosting options:**
- Docker image included
- Railway one-click deploy
- Vercel (static-friendly)

The share feature does use a Cloudflare Worker for public collection URLs — but that's entirely optional. Core app is 100% offline.

Repo: [link] | Live demo: bookmarkhub.app

---

### r/chrome_extensions

**Title:** I published a Chrome extension to fix X/Twitter bookmarks — imports everything in one click, organizes locally

**Body:**
Just hit the Chrome Web Store with an extension I've been building for a few months.

**BookmarkHub** — one-click import of all your X/Twitter bookmarks into a proper manager with:
- Collections, tags, and full-text search
- Smart tag auto-suggestions (NLP-based)
- Advanced filters
- Share collections publicly
- 100% local storage — data stays in your browser

No permissions beyond what's needed to read the bookmarks page.

Search "BookmarkHub" in the Web Store or visit bookmarkhub.app.

---

## Hacker News

**Title:** Show HN: BookmarkHub – Privacy-first bookmark manager for X/Twitter

**Body:**
I built BookmarkHub because X's bookmark system is a dead end — no search, no organization, no way to find anything you've saved.

BookmarkHub is a Chrome extension + React web app that:
- Imports all your X bookmarks in one click (DOM-based, no unofficial API)
- Organizes them in collections with tag-based filtering
- Stores everything in browser localStorage (no backend, no accounts)
- Supports full-text search, advanced filters, drag-and-drop
- Lets you share collections via public links (Cloudflare Worker)
- Exports as JSON for full portability

Tech: React 18 + TypeScript + Zustand + Vite + Chakra UI. Chrome extension uses MV3. Share API on Cloudflare Workers. 425/430 tests passing.

Privacy was a deliberate design constraint: nothing leaves the browser unless you explicitly share a collection. No analytics, no tracking, no server-side bookmark storage.

Demo: bookmarkhub.app
Chrome Web Store: [link]

Happy to go deep on any technical decisions (the extension import strategy, the local-first architecture, or the NLP tagging approach).

---

## X/Twitter Launch Thread

**Tweet 1 (hook):**
X bookmarks should be useful.
They're not.
So I built the fix.

🧵

---

**Tweet 2 (problem):**
I had 3,000+ bookmarks in X.
Great threads. Research. Resources. Ideas.

I could never find any of them.

No search. No folders. No tags.
Just an endless unsorted list.

---

**Tweet 3 (attempts to solve):**
I tried Notion. Too manual.
I tried third-party apps. They required API access I didn't want to give.
I tried ignoring it. Didn't work.

Eventually I just built the thing I wanted.

---

**Tweet 4 (what it is):**
Introducing BookmarkHub.

A Chrome extension + web app that fixes your X bookmarks.

- One-click import of ALL existing bookmarks
- Collections, tags, full-text search
- Smart tag suggestions (NLP-based)
- 100% local storage. Nothing leaves your browser.

bookmarkhub.app

---

**Tweet 5 (privacy angle):**
The privacy design was intentional.

Your bookmarks reveal a lot about you — what you read, who you follow, what you're researching.

BookmarkHub stores everything in your browser's localStorage. No account. No server. No tracking.
You can export it all as JSON anytime.

---

**Tweet 6 (sharing feature):**
Just shipped: Share Collections.

Curate a set of bookmarks → generate a public link → anyone can view it, no login needed.

Great for sharing resources, research, or reading lists with your audience.

---

**Tweet 7 (how it works):**
How the import works:

The Chrome extension reads your X bookmarks page and sends them to the local app. No unofficial API, no credentials stored. Same as opening bookmarks.twitter.com yourself — just automated.

---

**Tweet 8 (CTA):**
If your X bookmarks are a mess, give it a try.

Free. No account. Chrome extension in the Web Store.

👉 bookmarkhub.app

And if you build it into something useful — share what you make.

---

## Paid Ad Copy

### X/Twitter Ads ($150–200 budget)

**Ad 1 — Problem-focused**
Headline: Your X bookmarks are useless
Body: Saved 500 tweets. Can't find any of them. BookmarkHub imports all your bookmarks + gives you real search, tags, and collections. 100% private — nothing leaves your browser.
CTA: Organize for free →

---

**Ad 2 — Privacy-focused**
Headline: Your bookmarks should stay yours
Body: Most bookmark tools store your data on their servers. BookmarkHub keeps everything in your browser — no account, no tracking, no cloud. Just you and your saved tweets.
CTA: Try it free →

---

**Ad 3 — Feature-focused**
Headline: Search your X bookmarks. Finally.
Body: Find any saved tweet instantly. Filter by author, date, or media type. Organize into collections with smart auto-tags. Share curated lists publicly.
CTA: Get BookmarkHub →

---

### Reddit Ads ($100–150 budget)

**Ad 1 — r/productivity targeting**
Headline: Fix your X bookmark chaos
Body: BookmarkHub imports all your X bookmarks and gives you collections, full-text search, and smart tags. 100% local — nothing leaves your browser.
CTA: Try free at bookmarkhub.app

---

**Ad 2 — r/chrome_extensions / r/Twitter targeting**
Headline: The bookmark manager X never built
Body: One-click import, unlimited collections, full-text search, privacy-first. No account needed. Free Chrome extension.
CTA: bookmarkhub.app
