# Claude Development Guidelines

## Project: BookmarkHub

Privacy-focused bookmark management for X/Twitter with React, TypeScript, Chakra UI, and local storage.

**Core Principles:** Quality over speed • Test before commit • Document as you go • Follow the plan

---

## Start Every Session Here

1. **Check current status:** `git log --oneline -5 && git status`
2. **Review project docs:** [README.md](../../README.md), [NEXT_STEPS.md](../reference/NEXT_STEPS.md)
3. **Check recent changes:** Review PR checklist in README.md

---

## Documentation Structure

**Key Documentation:**

- [README.md](../../README.md) - Project overview, setup, and PR checklist
- [NEXT_STEPS.md](../reference/NEXT_STEPS.md) - Roadmap and feature planning
- [DEPLOYMENT.md](../deployment/DEPLOYMENT.md) - Deployment guide for Vercel
- [GITHUB_SETUP.md](../deployment/GITHUB_SETUP.md) - GitHub configuration
- [CODE_QUALITY_AUDIT.md](CODE_QUALITY_AUDIT.md) - Code quality standards

---

## Agent Usage Guidelines (CRITICAL)

**⚠️ ALWAYS use specialized agents for these tasks:**

### Frontend Tasks → frontend-dev agent

- Component updates and new components (BookmarkCard, TagSelector, etc.)
- State management with Zustand (useBookmarkStore, useSettingsStore)
- UI/UX changes, styling (Chakra UI v3 components)
- Hooks implementation (useFilteredBookmarks, useDebounce)
- React/TypeScript work

**Example:** "Update the bookmark card component" → Use frontend-dev agent

### After Code Changes → test-runner-fixer agent (PROACTIVE)

- Automatically run after implementing features
- Run after fixing bugs
- Run after refactoring
- Fix any test failures

**Example:** After any code change → Automatically use test-runner-fixer agent

### Code Quality → code-reviewer agent (PROACTIVE)

- Review after implementing features
- Review after fixing bugs
- Check for best practices
- Identify potential issues

**Example:** After completing feature → Use code-reviewer agent

### Codebase Exploration → Explore agent

- Finding files by patterns ("src/**/\*.tsx", "src/components/**/\*.ts")
- Searching for implementations ("bookmark filtering", "storage service")
- Understanding architecture ("how does tag filtering work?")

**Example:** "Find where bookmark filtering is implemented" → Use Explore agent

### File Operations → file-operations agent

- Reading specific files
- Creating new files
- Modifying existing files
- Searching for text patterns

**Example:** "Read the bookmark store file" → Use file-operations agent

**🚨 DO NOT manually search/grep when exploring - ALWAYS use the appropriate agent!**

---

## Pre-Commit Checklist

**Code:**

- [ ] Type safety: `npm run typecheck` passes
- [ ] Tests pass: `npm test`
- [ ] Linting: `npm run lint` passes
- [ ] No debug code or console.log statements

**Frontend:**

- [ ] Chakra UI v3 API used correctly
- [ ] Components use Zustand selectors
- [ ] LazyImage used for all images with meaningful alt text
- [ ] Memoization applied where needed (BookmarkCard lists)

**State & Data:**

- [ ] Filtering logic in hooks/useFilteredBookmarks.ts
- [ ] Domain types from types/ directory
- [ ] No `any` types
- [ ] Named exports for components/hooks

**Accessibility:**

- [ ] Focus states visible
- [ ] Interactive elements accessible
- [ ] Proper ARIA labels where needed

**Docs:**

- [ ] README.md updated if behavior changed
- [ ] Comments added for complex logic

---

## Essential Commands

### Development

```bash
npm run dev              # Start dev server (localhost:5173)
npm run build            # Production build
npm run preview          # Preview production build
npm run typecheck        # TypeScript type checking
npm run lint             # ESLint
npm run format           # Prettier formatting
```

### Testing

```bash
npm test                 # Run Vitest tests
npm run test:ui          # Tests with UI
npm run test:coverage    # Coverage report
npm run e2e              # Playwright E2E tests
npm run e2e:ui           # E2E with UI
```

### Storybook

```bash
npm run storybook        # Start Storybook dev server
npm run build-storybook  # Build static Storybook
```

### Git (Keep it Simple!)

**⚠️ CRITICAL: Commit messages MUST follow this format:**

```bash
<type>: <description>    # type: REQUIRED, description: 3-4 words max
```

**Required Type Prefixes:**

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - UI/styling changes (no logic)
- `refactor:` - Code restructuring (no behavior change)
- `test:` - Test additions/updates
- `chore:` - Maintenance/cleanup
- `perf:` - Performance improvements

**✅ GOOD (with type prefix, 3-5 words total):**

```
feat: Add smart tag suggestions
fix: Bookmark deletion bug
docs: Update deployment guide
refactor: Centralize bookmark filtering
test: Add tag selector tests
style: Improve mobile layout
chore: Remove debug logs
```

**❌ BAD (missing type OR too long):**

```
Add smart tag suggestions (no type prefix!)
feat: Add smart tag suggestions with AI-powered recommendations and caching (12 words!)
Update the bookmark card to support new features (no type prefix + too long!)
```

**Rules:**

- Type prefix is MANDATORY
- Description: 3-4 words max (after the type prefix)
- Focus on what changed, not why (details go in PR description)

### Deployment (Vercel)

```bash
# The app is deployed on Vercel
# Production URL: https://bookmarksx.vercel.app

# Deployment happens automatically on push to main
# Preview deployments created for PRs
```

**⚠️ IMPORTANT: Do NOT push to main immediately after every change!**

Vercel auto-deploys from `main`, so we batch commits locally and only push when ready to deploy.

**Workflow:**

1. Make changes and commit locally: `git commit -m "fix: your change"`
2. Continue working, make more commits as needed
3. When ready to deploy, ask: "Should I push to production?"
4. Only push when explicitly approved: `git push origin main`

---

## Project Structure (Key Locations)

```
bookmarksx/
├── CLAUDE.md                   # This file
├── README.md                   # Project overview & PR checklist
├── NEXT_STEPS.md              # Roadmap and planning
├── src/
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Zustand stores
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Utility functions
│   ├── services/              # API & storage services
│   └── lib/                   # Third-party configurations
├── tests/                     # Vitest & Playwright tests
├── chrome-extension/          # Browser extension
└── docs/                      # Additional documentation
```

---

## Daily Workflow

**Morning:**

1. Check [NEXT_STEPS.md](../reference/NEXT_STEPS.md) for priorities
2. Review `git log --oneline -5`
3. Start: `npm run dev`

**During:**

- Follow PR checklist in README.md
- Write tests alongside code
- Update documentation as needed

**Before commit:**

- Run checklist above
- Manual testing in browser
- `git diff` review
- **Check commit message: type prefix + 3-4 words max!**

**Evening:**

- Commit completed work (type: prefix + description)
- Update [NEXT_STEPS.md](../reference/NEXT_STEPS.md) if needed

---

## Tech Stack Reference

**Frontend:**

- React 19 with TypeScript
- Chakra UI v3 (component library)
- Zustand (state management)
- React Router (navigation)
- React Query (data fetching)

**Development:**

- Vite (build tool)
- Vitest (unit testing)
- Playwright (E2E testing)
- Storybook (component development)
- ESLint + Prettier (code quality)

**Key Libraries:**

- compromise (NLP for tag extraction)
- react-dnd (drag and drop)
- react-datepicker (date selection)
- lucide-react (icons)
- framer-motion (animations)

### Using Context7 MCP for Documentation

**Context7 MCP server provides up-to-date documentation for all libraries.**

When you need current API references or examples, use:

```
use context7 react@19              # React 19 documentation
use context7 @chakra-ui/react@3    # Chakra UI v3 documentation
use context7 zustand               # Zustand documentation
use context7 typescript            # TypeScript documentation
use context7 vite                  # Vite documentation
use context7 vitest                # Vitest documentation
use context7 react-router          # React Router documentation
```

**When to use Context7:**

- Checking current API syntax for Chakra UI v3 components
- Verifying React 19 hooks and patterns
- Looking up TypeScript utility types
- Confirming library method signatures
- Finding version-specific examples

**Example workflow:**

1. Need to implement a Chakra UI feature? → `use context7 @chakra-ui/react@3`
2. Unsure about React 19 hook? → `use context7 react@19`
3. TypeScript type question? → `use context7 typescript`

---

## Key Architectural Patterns

### State Management

- Use Zustand stores for global state
- Components use selectors: `const bookmarks = useBookmarkStore(s => s.bookmarks)`
- Call store actions directly: `useBookmarkStore.getState().addBookmark()`

### Filtering Logic

- Lives in `hooks/useFilteredBookmarks.ts` and `utils/bookmarkFiltering.ts`
- Centralized for consistency
- Use the hook in components: `const { filteredBookmarks } = useFilteredBookmarks()`

### Component Patterns

- Use `components/LazyImage` for all images
- Meaningful alt text for accessibility
- Memoize expensive components (BookmarkCard lists)
- Named exports for components and hooks

### Type Safety

- Domain types in `types/` directory
- No `any` types
- X/Twitter payloads normalized once on import
- Zod schemas for validation

---

## Privacy & Security

- **100% Local Storage**: All data in browser localStorage
- **No Backend**: No server, no database
- **No Tracking**: No analytics or user tracking
- **Export/Import**: Users control their data
- **Input Sanitization**: All user input sanitized
- **XSS Prevention**: React's built-in protection + sanitization

---

## Getting Help

**Project questions:**

1. [README.md](../../README.md) for setup and PR checklist
2. [NEXT_STEPS.md](../reference/NEXT_STEPS.md) for roadmap
3. Recent commits: `git log --oneline -10`

**Claude Code issues:**

- `/help` command
- https://github.com/anthropics/claude-code/issues

---

## New to Project? Start Here:

1. Read [README.md](../../README.md)
2. Run `npm install && npm run dev`
3. Open `http://localhost:5173`
4. Review [NEXT_STEPS.md](../reference/NEXT_STEPS.md) for roadmap
5. Check PR checklist in README.md before committing
6. Review recent commits: `git log --oneline -10`

**Remember:** Check README.md PR checklist → Use agents for specialized tasks → Update docs → Simple commits
