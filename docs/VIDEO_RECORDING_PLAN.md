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
