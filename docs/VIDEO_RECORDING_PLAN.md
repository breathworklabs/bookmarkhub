# Video Recording for Documentation - Implementation Plan

**Status:** Planning phase - not yet implemented
**Date:** 2025-11-11

---

## Executive Summary

Research into using Kap and Playwright for creating documentation videos. **Recommendation: Playwright-First Approach** - leverage existing Playwright setup for automated documentation videos.

---

## Research Findings

### Kap Screen Recorder
- **What it is:** Open-source screen recorder for macOS
- **Formats:** GIF, MP4, WebM, APNG
- **Install:** `brew install --cask kap`
- **Limitation:** ❌ No CLI/API - cannot be automated programmatically
- **Best for:** Manual high-quality recordings

### Playwright Video Recording
- **Status:** ✅ Already installed (v1.55.1) and configured
- **Current config:** `video: 'retain-on-failure'` in `playwright.config.ts`
- **Formats:** `.webm` (default)
- **Best for:** Automated feature demos, reproducible recordings

---

## Recommended Implementation: Playwright-First

### Why Playwright?
- ✅ Already installed and configured
- ✅ Cross-platform (Chromium, Firefox, Safari)
- ✅ Automated and reproducible
- ✅ Zero additional dependencies
- ✅ Integrates with existing test suite

### Why Not Kap?
- ❌ No programmatic control (GUI only)
- ❌ macOS only
- ❌ Cannot be integrated into automated workflows
- ✅ Can still be used separately for manual recordings

---

## Implementation Plan

### Phase 1: Playwright Documentation Videos (Primary)

#### 1. Update Playwright Configuration
File: `playwright.config.ts`

Add dedicated project for documentation videos:

```typescript
projects: [
  // ... existing projects
  {
    name: 'docs-videos',
    testDir: './tests/e2e/docs',
    use: {
      ...devices['Desktop Chrome'],
      video: 'on',  // Always record for docs
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: './docs/videos/',
        size: { width: 1920, height: 1080 }
      }
    }
  }
]
```

#### 2. Create Documentation Test Suite
Directory: `tests/e2e/docs/`

**Test Files to Create:**
- `01-onboarding-demo.spec.ts` - First-time user onboarding flow
- `02-import-bookmarks-demo.spec.ts` - Import workflow from X/Twitter
- `03-filtering-demo.spec.ts` - Search and filter features
- `04-collections-demo.spec.ts` - Collections management
- `05-export-demo.spec.ts` - Export functionality

**Example Test Structure:**
```typescript
import { test, expect } from '@playwright/test'

test('Demo: Import bookmarks workflow', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:5173')

  // Perform import workflow
  await page.click('[data-testid="import-button"]')
  // ... record the exact workflow ...

  // Video automatically saved to docs/videos/
})
```

#### 3. Add npm Scripts
File: `package.json`

```json
{
  "scripts": {
    "docs:record": "playwright test --project=docs-videos",
    "docs:record:single": "playwright test --project=docs-videos -g"
  }
}
```

**Usage:**
```bash
# Record all documentation videos
npm run docs:record

# Record specific demo
npm run docs:record:single "Import bookmarks"
```

#### 4. Create Video Storage Structure
```
docs/
  videos/
    features/          # Feature demonstration videos
      import.webm
      filtering.webm
      collections.webm
    tutorials/         # Step-by-step guides
    workflows/         # Common user journeys
    README.md          # Video index and descriptions
```

#### 5. Create Documentation Files

**File: `docs/videos/README.md`**
```markdown
# Documentation Videos

This directory contains recorded demos and tutorials for BookmarkHub.

## Features
- `import.webm` - Importing bookmarks from X/Twitter
- `filtering.webm` - Search and filter capabilities
- `collections.webm` - Managing collections

## Recording New Videos
See [VIDEO_RECORDING.md](../VIDEO_RECORDING.md) for guidelines.
```

**File: `docs/VIDEO_RECORDING.md`**
```markdown
# Video Recording Guidelines

## Automated Recording (Playwright)

### Recording a New Demo
1. Create test file in `tests/e2e/docs/`
2. Run `npm run docs:record`
3. Video saved to `docs/videos/`

### Best Practices
- Use 1920x1080 resolution
- Add clear page.waitForTimeout() for visibility
- Test locally before committing
- Keep demos under 2 minutes

### Converting Videos
```bash
# WebM to MP4
ffmpeg -i input.webm -c:v libx264 -preset slow -crf 22 output.mp4

# Video to GIF (for README)
ffmpeg -i input.mp4 -vf "fps=10,scale=800:-1" output.gif
```

## Manual Recording (Kap)

For high-quality tutorial videos:
1. Install Kap: `brew install --cask kap`
2. Configure settings (1920x1080, 60fps)
3. Record manually
4. Export as MP4
5. Save to `docs/videos/tutorials/`
```

---

## Phase 2: Manual Recording Setup (Optional)

### Tools for Manual Recording

#### Option A: Kap (Free)
```bash
brew install --cask kap
```
- ✅ Free and open-source
- ✅ High quality
- ✅ Multiple export formats
- ❌ macOS only
- ❌ No automation

#### Option B: CleanShot X ($29)
- ✅ Better quality than Kap
- ✅ More features
- ✅ Faster workflow
- ❌ Paid
- ❌ macOS only

#### Option C: OBS Studio (Free)
```bash
brew install --cask obs
```
- ✅ Free and professional-grade
- ✅ Cross-platform
- ✅ Can be automated (WebSocket API)
- ❌ Steep learning curve

---

## Phase 4: Video Ad Production for Social Media (Marketing Videos)

**Status:** Research completed - 2025-11-17
**Purpose:** Tools for creating 15-30 second video ads for Twitter/X, Instagram, TikTok

### Overview

For creating short-form video ads (not documentation), different tools excel at different tasks:
- **Screen recording**: Capture BookmarksX interface interactions
- **Video editing**: Add text overlays, effects, transitions
- **Post-production**: Final polish, exports optimized for social media

---

### Recommended Mac Software for Video Ads

#### Option 1: Screen Studio (BEST FOR PRODUCT DEMOS) 💎
**Website:** https://screen.studio/
**Price:** ~$89 one-time purchase

**What makes it special:**
- ✅ **Automatic zoom on mouse actions** - Perfect for highlighting UI interactions
- ✅ **Smooth cursor movement** - Professional polish without manual editing
- ✅ **Built-in animations and effects** - No separate editing software needed
- ✅ **5-minute workflow** - Record to polished video in minutes
- ✅ **macOS-optimized** - Native performance on Apple Silicon
- ✅ **Ideal for 15-30 second demos** - Purpose-built for product showcases

**Best for:**
- Recording BookmarksX interface demonstrations
- Showing drag-and-drop, search, collections features
- Creating professional demos with minimal effort

**When to use:**
- Primary tool for screen recording product demos
- Final export ready for social media with minimal editing

---

#### Option 2: CapCut (BEST FREE OPTION) ⭐
**Download:** CapCut.com (Mac desktop app)
**Price:** FREE (no watermark!)

**Features:**
- ✅ **Completely free** with professional features
- ✅ **Auto-captions** - AI-generated subtitles for engagement
- ✅ **Text-to-speech and AI tools** - Voiceovers without recording
- ✅ **Template library** - Quick start with pre-made styles
- ✅ **Optimized for TikTok, Reels, Shorts** - Export presets included
- ✅ **Timeline editing** - Professional multi-track editing
- ✅ **Effects and transitions** - Large library included

**Best for:**
- Adding text overlays with user pain points
- Creating multiple video variants quickly
- A/B testing different hooks and messaging
- Adding effects, transitions, and music

**When to use:**
- Primary editing tool for free workflow
- Adding text overlays to Playwright/QuickTime recordings
- Creating variants from single screen recording

---

#### Option 3: ScreenFlow (BEST ALL-IN-ONE) 🎬
**Website:** https://www.telestream.net/screenflow/
**Price:** $169 one-time purchase

**Features:**
- ✅ **Screen recording + video editing** in one app
- ✅ **Transitions, text animations, annotations**
- ✅ **Styles and Templates** - Consistent branding across videos
- ✅ **Multi-channel audio** - Add music + voiceover simultaneously
- ✅ **iPhone/iPad screen mirroring** - Record mobile versions
- ✅ **Professional output quality** - Broadcast-ready exports

**Best for:**
- Complete workflow from recording to final export
- Teams needing consistent branding across videos
- Creating reusable templates for video series

**When to use:**
- All-in-one solution if you want single software
- Building template library for ongoing video production
- Professional quality with full control

---

#### Option 4: iMovie (EASIEST START) 🍎
**Price:** FREE (built-in on Mac)

**Features:**
- ✅ **Already installed** - No download needed
- ✅ **Simple, intuitive interface** - Zero learning curve
- ✅ **Basic transitions and text overlays**
- ✅ **Export optimized for social media**
- ✅ **Good enough for testing concepts**

**Best for:**
- Absolute beginners
- Quick concept testing
- Learning video editing basics

**When to use:**
- First video attempts before investing in paid tools
- Simple edits to Playwright-recorded demos

---

#### Option 5: Final Cut Pro (PROFESSIONAL) 🎥
**Price:** $299 one-time purchase (Apple)

**Features:**
- ✅ **Apple's professional video editor**
- ✅ **AI-powered auto-captions**
- ✅ **Automatic social media formatting**
- ✅ **Text-to-video conversion**
- ✅ **Optimized for Apple Silicon** - Blazing fast
- ✅ **Magnetic Timeline** - Revolutionary editing workflow

**Best for:**
- Long-term investment in video content
- Professional-quality marketing materials
- High-volume video production

**When to use:**
- Planning to create lots of video content
- Need maximum control and quality
- Budget allows for professional tools

---

### Comparison Table

| Software | Price | Screen Recording | Video Editing | Learning Curve | Speed | Best For |
|----------|-------|------------------|---------------|----------------|-------|----------|
| **Screen Studio** | $89 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Low | ⚡️ Fast | Product demos |
| **CapCut** | FREE | ❌ | ⭐⭐⭐⭐⭐ | Low | ⚡️ Fast | Social media ads |
| **ScreenFlow** | $169 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Medium | Medium | All-in-one |
| **iMovie** | FREE | ❌ | ⭐⭐⭐ | Very Low | Fast | Beginners |
| **Final Cut Pro** | $299 | ❌ | ⭐⭐⭐⭐⭐ | High | ⚡️ Fast | Professionals |
| **QuickTime** | FREE | ⭐⭐ | ❌ | Very Low | Fast | Basic recording |

---

### Recommended Workflows

#### Workflow A: Free Stack (Start Here) 💰

**Tools:**
1. **QuickTime** (built-in) - Screen recording
2. **CapCut** (free) - Editing, text overlays, effects
3. **Export** - Optimized for Twitter/X, Instagram, TikTok

**Process:**
```bash
1. Record screen with QuickTime (⌘+Ctrl+N)
2. Import to CapCut
3. Add text overlays with pain points
4. Add auto-captions
5. Export 1080p MP4
```

**Cost:** $0
**Time:** 30-60 minutes per video (after learning)
**Quality:** Good - Professional enough for social media

---

#### Workflow B: Premium Workflow (Recommended) 🏆

**Tools:**
1. **Screen Studio** ($89) - Record & auto-polish
2. **CapCut** (free) - Optional extra effects/text
3. **Export** - High-quality MP4

**Process:**
```bash
1. Record with Screen Studio (automatic zoom, smooth cursor)
2. Export polished demo
3. Optional: Import to CapCut for text overlays
4. Export for social media
```

**Cost:** $89 one-time
**Time:** 5-15 minutes per video
**Quality:** Excellent - Professional product demos

---

#### Workflow C: All-in-One Professional 🎬

**Tools:**
1. **ScreenFlow** ($169) - Complete production
2. **Export** - Multiple format outputs

**Process:**
```bash
1. Record screen in ScreenFlow
2. Edit with templates (transitions, text, music)
3. Apply consistent branding
4. Export with presets
```

**Cost:** $169 one-time
**Time:** 20-40 minutes per video
**Quality:** Excellent - Full creative control

---

#### Workflow D: Automated + Manual Hybrid (Best Value) 🤖

**Tools:**
1. **Playwright** (free, already installed) - Automated screen recording
2. **CapCut** (free) - Manual editing and polish

**Process:**
```bash
# 1. Automated recording
npm run docs:record

# 2. Locate video in test-results/
# 3. Import to CapCut
# 4. Add text overlays, effects, music
# 5. Export for social media
```

**Cost:** $0
**Time:** 10-20 minutes per video (after automation setup)
**Quality:** Good - Consistent demos with creative editing

---

### Quick Start Guide

#### Day 1: Test Concepts (Free)
1. **Install CapCut** (free download)
2. **Record with QuickTime** or Playwright
3. **Edit in CapCut** - Try 3 different hooks
4. **Export and test** on Twitter/X

#### Week 1: Evaluate Results
- Analyze which hooks perform best
- Determine if you need faster workflow
- Decide on tool investment

#### Investment Decision:
- **If creating 10+ videos:** Buy Screen Studio ($89)
- **If need full control:** Buy ScreenFlow ($169)
- **If budget allows:** Buy Final Cut Pro ($299)
- **If unsure:** Stick with free tools for now

---

### Video Ad-Specific Features

#### Text Overlays (Pain Points)
**Best tools:**
- CapCut: Built-in templates, animations
- ScreenFlow: Customizable text styles
- Final Cut Pro: Advanced motion graphics

**Example text overlays:**
- "Twitter only shows 780 bookmarks"
- "No search. No folders. No hope."
- "Deleted tweets = Lost bookmarks"

---

#### Auto-Captions
**Best tools:**
- CapCut: FREE auto-captions (AI-powered)
- Final Cut Pro: Built-in auto-captions
- Descript: Specialized transcription ($12/month)

**Why use captions:**
- 85% of social media videos watched without sound
- Better engagement and accessibility
- SEO benefits for video content

---

#### Social Media Export Presets
**Best tools:**
- CapCut: TikTok, Instagram Reels, YouTube Shorts presets
- ScreenFlow: Custom export templates
- Final Cut Pro: Social media destinations

**Recommended formats:**
- **Twitter/X:** 1080x1920 (vertical) or 1920x1080 (horizontal)
- **Instagram Reels:** 1080x1920 (9:16 aspect ratio)
- **TikTok:** 1080x1920 (9:16 aspect ratio)
- **YouTube Shorts:** 1080x1920 (9:16 aspect ratio)

---

### Integration with Existing Playwright Setup

You already have Playwright configured! Use it for automated video recording:

#### Current Config (from playwright.config.ts):
```typescript
video: 'retain-on-failure'
```

#### For Marketing Videos:
```typescript
// Add to playwright.config.ts
{
  name: 'marketing-videos',
  testDir: './tests/e2e/marketing',
  use: {
    video: 'on',  // Always record
    viewport: { width: 1920, height: 1080 },
  }
}
```

#### Create Marketing Demo Tests:
```typescript
// tests/e2e/marketing/twitter-problem-demo.spec.ts
test('Demo: Twitter bookmark search problem', async ({ page }) => {
  await page.goto('http://localhost:5173')

  // Simulate user trying to find bookmark
  await page.click('[data-testid="bookmarks-list"]')
  await page.waitForTimeout(2000) // Show scrolling frustration

  // Show BookmarksX search solution
  await page.click('[data-testid="search-input"]')
  await page.fill('[data-testid="search-input"]', 'productivity')
  await page.waitForTimeout(1000)

  // Results appear instantly
  // Video saved automatically
})
```

**Benefits:**
- ✅ Reproducible demos (same quality every time)
- ✅ No manual recording needed
- ✅ Update videos by re-running tests
- ✅ Version control for video content

---

### Recommended Tech Stack by Budget

#### Budget: $0 (Free)
```
Recording: QuickTime + Playwright
Editing: CapCut
Export: Social media presets
```
**Time investment:** High (manual recording)
**Quality:** Good

---

#### Budget: $89 (Best Value)
```
Recording: Screen Studio
Editing: CapCut (for text overlays)
Export: MP4 high-quality
```
**Time investment:** Low (automated polish)
**Quality:** Excellent

---

#### Budget: $169 (All-in-One)
```
Recording: ScreenFlow
Editing: ScreenFlow
Export: ScreenFlow templates
```
**Time investment:** Medium (single tool)
**Quality:** Excellent

---

#### Budget: $299+ (Professional)
```
Recording: Screen Studio
Editing: Final Cut Pro
Export: Social media destinations
```
**Time investment:** Medium (full control)
**Quality:** Outstanding

---

### Additional Tools Research

#### For Post-Production Polish:

**Descript** ($12/month)
- AI-powered transcription and editing
- Edit video by editing text
- Remove filler words automatically
- Great for voiceover videos

**Motion** (Free templates)
- Pre-made motion graphics templates
- Can use with Final Cut Pro
- Professional animations

**Epidemic Sound** ($15/month)
- Royalty-free music library
- Safe for social media monetization
- High-quality tracks

---

### Best Practices for Video Ads

#### Keep It Short
- **Twitter/X:** 15-30 seconds optimal
- **Instagram Reels:** 15-60 seconds
- **TikTok:** 15-60 seconds
- **YouTube Shorts:** Under 60 seconds

#### Hook Within 3 Seconds
- Use text overlay with pain point
- Show problem immediately
- Create curiosity gap

#### Always Include:
- ✅ Problem statement (0-3s)
- ✅ Solution demo (3-15s)
- ✅ Key benefit (15-20s)
- ✅ Clear CTA (20-30s)

#### Optimize for Sound-Off Viewing:
- ✅ Add captions to all videos
- ✅ Use text overlays for key points
- ✅ Visual storytelling (don't rely on audio)

---

### Sample Video Production Timeline

#### Video 1: "No Search Problem"
- **Recording:** 5 min (Screen Studio)
- **Editing:** 10 min (add text overlays in CapCut)
- **Export:** 2 min
- **Total:** ~17 minutes

#### Video 2: "800 Bookmark Limit"
- **Recording:** 5 min
- **Editing:** 10 min
- **Export:** 2 min
- **Total:** ~17 minutes

#### Video 3-5: Additional Variants
- **Per video:** ~15-20 minutes
- **Total for 5 videos:** ~90 minutes

**With automation (Playwright):**
- **Setup tests:** 2 hours (one-time)
- **Per video:** 10 minutes editing only
- **Total for 5 videos:** ~50 minutes (after setup)

---

### Next Steps for Video Ad Production

1. **Immediate (Today):**
   - Download CapCut (free)
   - Record first test video with QuickTime
   - Edit in CapCut with pain point text overlay
   - Export and review quality

2. **This Week:**
   - Test 3-5 different hooks
   - Evaluate performance on Twitter/X
   - Decide on tool investment based on results

3. **After Validation:**
   - Purchase Screen Studio ($89) if creating regular content
   - Set up Playwright marketing demos for automation
   - Build template library for consistent branding

---

### References & Resources

**Software Downloads:**
- [Screen Studio](https://screen.studio/) - Product demo specialist
- [CapCut Desktop](https://www.capcut.com/) - Free video editor
- [ScreenFlow](https://www.telestream.net/screenflow/) - All-in-one Mac solution
- [Final Cut Pro](https://www.apple.com/final-cut-pro/) - Apple's professional editor

**Tutorials:**
- CapCut tutorials: YouTube search "CapCut desktop tutorial"
- Screen Studio docs: Built-in help system
- ScreenFlow tutorials: Telestream website

**Best Practices:**
- Twitter Video Specs: [Twitter Media Guide](https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/overview)
- Instagram Specs: [Instagram Help Center](https://help.instagram.com/1631821640426723)
- TikTok Specs: [TikTok Creator Portal](https://www.tiktok.com/creators/creator-portal/)

---

## Phase 3: Post-Processing (Optional)

### Video Conversion Tools

Install FFmpeg:
```bash
brew install ffmpeg
```

**Convert WebM to MP4:**
```bash
ffmpeg -i input.webm -c:v libx264 -preset slow -crf 22 output.mp4
```

**Create GIF from Video:**
```bash
ffmpeg -i input.mp4 -vf "fps=10,scale=800:-1" output.gif
```

**Compress Video:**
```bash
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 output-compressed.mp4
```

---

## Alternative Tools Research

### Top-Rated Tools (2025)
| Tool | Cost | Automation | Quality | Platform |
|------|------|------------|---------|----------|
| Playwright | Free | ✅ Excellent | Good | Cross-platform |
| Kap | Free | ❌ None | Excellent | macOS |
| CleanShot X | $29 | ❌ None | Excellent | macOS |
| OBS Studio | Free | ✅ Good | Excellent | Cross-platform |
| Loom | Free/Paid | ❌ None | Good | Cloud-based |
| Framecap | $19 | ✅ Excellent | Good | macOS |

---

## Recommended Workflow

### For Feature Demos (Automated)
1. Write Playwright test in `tests/e2e/docs/`
2. Run `npm run docs:record`
3. Video saved to `docs/videos/features/`
4. Optional: Convert to MP4 or GIF
5. Reference in documentation

### For Marketing/Tutorial Videos (Manual)
1. Use Kap or CleanShot X
2. Record with narration
3. Export as MP4
4. Save to `docs/videos/tutorials/`
5. Embed in documentation site

---

## Files to Create/Modify

When implementing this plan:

1. ✅ `playwright.config.ts` - Add docs-videos project
2. ✅ `tests/e2e/docs/*.spec.ts` - 5 demo test files (NEW)
3. ✅ `package.json` - Add docs:record scripts
4. ✅ `docs/videos/README.md` - Video index (NEW)
5. ✅ `docs/VIDEO_RECORDING.md` - Recording guidelines (NEW)
6. ✅ `.gitignore` - Add `docs/videos/*.webm` (optional)

---

## Current Playwright Config

From `playwright.config.ts`:
```typescript
use: {
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',  // Current setting
}
```

Videos currently saved to: `test-results/` directory

---

## Next Steps (When Ready to Implement)

1. **Immediate:**
   - Update `playwright.config.ts` with docs-videos project
   - Create `tests/e2e/docs/` directory
   - Add npm scripts for recording
   - Create first demo test (onboarding flow)

2. **Short-term:**
   - Install Kap or CleanShot X for manual recordings
   - Create `docs/VIDEO_RECORDING.md` guidelines
   - Set up `docs/videos/` directory structure

3. **Long-term:**
   - Build complete documentation test suite
   - Create high-quality tutorial videos
   - Add GIFs to README for key features
   - Consider automated video generation in CI/CD

---

## Estimated Time

- **Phase 1 (Playwright setup):** 1-2 hours
- **Phase 2 (Manual tools):** 30 minutes
- **Phase 3 (Post-processing setup):** 1 hour
- **Creating actual demo videos:** 2-4 hours

**Total:** ~4-7 hours for complete setup + initial demos

---

## References

- [Playwright Video Recording Docs](https://playwright.dev/docs/videos)
- [Kap GitHub](https://github.com/wulkano/kap)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- Current E2E tests: `tests/e2e/*.spec.ts`

---

**Note:** This is a planning document. Implementation pending user approval.


---

inal 15-Second Intro Video Script

  "Tired of losing Twitter bookmarks? BookmarkHub brings smart organization with drag-and-drop collections, powerful search filters, and bulk operations - all stored privately on your device. No
  tracking. Just organized bookmarks."

  ---
  Visual Guide:

  - 0-3s: Chaotic bookmarks → Clean BookmarkHub interface
  - 3-6s: Drag-and-drop demonstration
  - 6-9s: Search with filters
  - 9-12s: Bulk operations
  - 12-15s: Privacy emphasis + CTA

  ---
