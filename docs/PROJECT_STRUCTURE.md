# Project Structure

This document outlines the organized folder structure of the X Bookmark Manager project.

## 📁 Root Directory

### Configuration Files
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `vitest.config.ts` - Vitest testing configuration
- `eslint.config.js` - ESLint configuration
- `playwright.config.ts` - Playwright E2E testing configuration
- `index.html` - Application entry point

### Core Directories
- `src/` - Source code (components, hooks, stores, utils, types)
- `public/` - Static assets
- `tests/` - E2E tests and fixtures
- `node_modules/` - Dependencies (auto-generated)

## 📁 Organized Folders

### `docs/` - Documentation
- `CLAUDE.md` - Development guidelines and coding standards
- `tests.md` - Test coverage overview and E2E plan
- `TODO.md` - Project todos and task tracking
- `PROJECT_STRUCTURE.md` - This file

### `data/` - Test Data & Imports
- `test-data.json` - X/Twitter bookmark test data
- `clickup_import.csv` - ClickUp import data

### `tools/` - Development Utilities
- `debug/` - Debug scripts and utilities
  - `check-data-source.js`
  - `debug-archived.js`
  - `debug-localStorage.js`
  - `debug-store-vs-localStorage.js`

## 🚫 Excluded from Version Control

The following build artifacts and temporary files are excluded via `.gitignore`:
- `dist/` - Build output
- `test-results/` - Playwright test results
- `playwright-report/` - Playwright test reports
- `tsconfig.tsbuildinfo` - TypeScript build cache
- `coverage/` - Test coverage reports
- `*.tmp`, `*.temp` - Temporary files

## 🎯 Benefits of This Structure

1. **Clean Root**: Only essential config files and core directories in root
2. **Organized Documentation**: All docs in one place for easy access
3. **Separated Data**: Test data and imports isolated from source code
4. **Tool Organization**: Debug utilities grouped together
5. **Build Cleanliness**: All artifacts properly excluded from version control
