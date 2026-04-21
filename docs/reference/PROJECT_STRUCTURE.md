# BookmarkHub Project Structure

**Updated: April 2026**

Privacy-focused bookmark manager for X/Twitter with React, TypeScript, Chakra UI v3, and local storage.

## Core Architecture

```
bookmarksx/
├── src/                          # Main application source
│   ├── components/               # React components
│   │   ├── BookmarkCard/        # Bookmark display components
│   │   ├── views/                # View management
│   │   ├── filters/             # Filter UI components
│   │   ├── modals/              # Modal dialogs
│   │   ├── tags/                # Tag management UI
│   │   ├── UnifiedSidebar.tsx   # Main navigation sidebar
│   │   ├── SettingsPage.tsx     # Settings interface
│   │   └── XBookmarkManager.tsx # Main app container
│   │
│   ├── store/                   # Zustand state management
│   │   ├── bookmarkStore.ts     # Bookmarks & UI state
│   │   ├── viewStore.ts          # Views management
│   │   └── settingsStore.ts     # App settings
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useFilteredBookmarksOptimized.ts  # Centralized filtering
│   │   ├── useViewFilteredBookmarks.ts   # View-based filtering
│   │   ├── useDebounce.ts       # Debounced values
│   │   └── useMobile.ts         # Mobile detection
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── bookmark.ts          # Bookmark types
│   │   ├── views.ts              # View types
│   │   └── settings.ts          # Settings types
│   │
│   ├── services/                # Business logic & APIs
│   │   ├── storage.ts           # Local storage service
│   │   ├── bookmarkService.ts   # Bookmark operations
│   │   └── smartTagging/        # AI tag suggestions
│   │
│   ├── utils/                   # Utility functions
│   │   ├── bookmarkFilteringOptimized.ts # Filter logic
│   │   ├── viewFiltering.ts   # Views-based filtering
│   │   ├── viewMigration.ts   # Collections→Views migration
│   │   └── sanitization.ts      # XSS prevention
│   │
│   ├── styles/                  # CSS & styling
│   │   └── components.ts        # Component styles
│   │
│   └── assets/                  # Static assets
│       └── logo_v2 1.png        # App logo
│
├── chrome-extension/            # Chrome extension for X/Twitter
│   ├── manifest.json            # Extension manifest
│   ├── popup/                   # Extension popup UI
│   ├── background/              # Service worker
│   ├── content-scripts/         # Page injection scripts
│   ├── assets/icons/            # Extension icons
│   ├── docs/                    # Extension documentation
│   │   └── store-submission/    # Chrome Web Store materials
│   └── tools/                   # Development tools
│
├── tests/                       # Test files
│   ├── e2e/                     # Playwright E2E tests
│   └── fixtures/                # Test data
│
├── public/                      # Static public assets
│   ├── favicon.ico              # Browser favicon
│   └── logo.png                 # App logo
│
└── docs/                        # Project documentation
    └── reference/              # Reference documentation
```

## Key Files

### Configuration

- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `playwright.config.ts` - E2E test configuration

### Root Documentation

- `README.md` - Project overview & setup
- `CLAUDE.md` - Development guidelines (in docs/dev/)
- `NEXT_STEPS.md` - Roadmap & planning

## State Management (Zustand)

### bookmarkStore

- Bookmarks collection
- UI state (active sidebar item, AI panel)
- View mode (grid/list)
- Selected bookmarks (for bulk actions)

### viewStore

- Views hierarchy (custom views)
- System views (All, Starred, Trash, Archive, etc.)
- Active view selection
- View CRUD operations
- Smart view criteria

### settingsStore

- Extension integration settings
- Display preferences (theme, sorting)
- Privacy & data management

## Data Flow

1. **Chrome Extension** → Extracts X/Twitter bookmarks
2. **localStorage** → Persists data locally
3. **Zustand Stores** → Manages app state
4. **React Components** → Renders UI
5. **Hooks** → Filters, searches, and transforms data

## Key Features

### Bookmark Management

- Import from X/Twitter via Chrome extension
- Search by title, content, author, domain
- Multi-criteria filtering
- Views for organization
- Tags for categorization
- Bulk operations (tag, delete, move)

### Privacy-First

- 100% local storage
- No backend servers
- No tracking or analytics
- Export/import in JSON/CSV/HTML

### Smart Organization

- AI-powered tag suggestions (in development)
- Nested views
- Custom sorting options
- Advanced filters

## Technology Stack

**Frontend:**

- React 19 + TypeScript
- Chakra UI v3 (component library)
- Zustand (state management)
- React Router (navigation)

**Development:**

- Vite (build tool)
- Vitest (unit testing)
- Playwright (E2E testing)
- ESLint + Prettier

**Key Libraries:**

- compromise (NLP for tags)
- react-dnd (drag & drop)
- framer-motion (animations)
- lucide-react (icons)

## Development Workflow

### Commands

```bash
npm run dev              # Start dev server (localhost:5173)
npm run build            # Production build
npm run typecheck        # TypeScript checking
npm run lint             # ESLint
npm test                 # Vitest tests
npm run e2e              # Playwright E2E tests
```

### Component Guidelines

- Use Chakra UI v3 components
- Named exports for components/hooks
- Memoize expensive components
- Use LazyImage for all images
- Centralized filtering in hooks

### Testing

- Unit tests with Vitest
- E2E tests with Playwright
- Test coverage expected
- No console.log in production

## Chrome Extension Integration

The extension extracts bookmarks from X/Twitter and sends them to the local app via:

1. User clicks extension icon on X/Twitter
2. Extension scrapes bookmark data
3. Data sent to localhost BookmarkHub app
4. App stores in localStorage
5. UI updates automatically

## Future Enhancements

- Advanced AI-powered organization
- Browser sync across devices
- Offline archive of web pages
- Collaboration features
- Mobile app (PWA)

---

For development guidelines, see [CLAUDE.md](../dev/CLAUDE.md)
For roadmap and planning, see [NEXT_STEPS.md](NEXT_STEPS.md)
