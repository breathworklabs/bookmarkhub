# X Bookmark Manager

A privacy-focused bookmark management application for X/Twitter content, built with React, TypeScript, and Vite.

## Features

- 🔒 **Privacy-First**: All bookmark data stored locally in your browser
- 📱 **Modern UI**: Dark theme with Twitter/X-inspired design
- 🔍 **Advanced Search**: Full-text search with tag filtering
- ⭐ **Smart Organization**: Star important bookmarks, filter by tags
- 📊 **AI Insights**: Get insights and summaries of your bookmarks
- 🎯 **No Account Required**: Works completely offline, no sign-up needed

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Library**: Chakra UI v3
- **State Management**: Zustand
- **Build Tool**: Vite
- **Storage**: Browser LocalStorage (privacy-focused)
- **Testing**: Vitest + React Testing Library
- **Development**: ESLint, Hot Module Replacement (HMR)

## Privacy & Data

- **100% Local Storage**: Your bookmarks never leave your device
- **No Tracking**: No analytics, cookies, or user tracking
- **Export/Import**: Full control over your data with JSON export/import
- **Browser Storage**: Uses secure browser localStorage API
- **No Account Required**: No sign-up, no passwords, no personal information collected

## Getting Started

1. **Clone and Install**
```bash
git clone <repository-url>
cd x-bookmark-manager2
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

3. **Open in Browser**
Navigate to `http://localhost:5173` and start managing your bookmarks!

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode

## Usage

### Managing Bookmarks
- **Add Bookmarks**: Use the "+" button to add new X/Twitter bookmarks
- **Search**: Use the search bar to find bookmarks by content or tags
- **Filter**: Use tag filters to organize your bookmarks
- **Star**: Mark important bookmarks with the star button
- **Export**: Download your bookmarks as JSON for backup

### Data Management
- **Local Storage**: All data is stored in your browser's localStorage
- **Export/Import**: Use the settings menu to backup or restore bookmarks
- **Storage Limit**: Modern browsers support ~5-10MB of localStorage
- **Data Persistence**: Bookmarks persist across browser sessions

## Development

### Running Tests
```bash
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
```

### Building for Production
```bash
npm run build           # Create production build
npm run preview         # Preview production build locally
```

## Browser Compatibility

- Chrome/Edge 87+
- Firefox 78+
- Safari 14+
- Any modern browser with localStorage support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details
