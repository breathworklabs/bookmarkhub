# Claude Code Instructions

## Development Guidelines

### Testing
- **Debug problems in tests**: When tests fail, always investigate the root cause and fix issues properly
- **Use Vitest**: This project uses Vitest, not Jest. Use `vi.` instead of `jest.` methods
- **Create comprehensive tests**: Write thorough tests that cover edge cases and real-world scenarios
- **Fix test failures**: Never ignore failing tests - debug and resolve all test issues

### UI Framework
- **Follow Chakra UI v3**: This project uses Chakra UI v3. Always check v3 documentation for correct components and props
- **Use correct imports**: Import components from '@chakra-ui/react' with proper v3 syntax
- **Component structure**: Use v3 component patterns (e.g., `Menu.Root`, `Menu.Trigger`, `Menu.Content` instead of deprecated patterns)
- **Icons**: Use Lucide React icons (`react-icons/lu`) when available

### Code Quality
- **TypeScript**: Maintain strict TypeScript compliance
- **Error handling**: Always handle errors gracefully
- **Performance**: Consider performance implications, especially for filtering and data operations
- **Debugging**: Add proper debugging tools when needed, but remove console.logs in production code

### Planning and Changes
- **Ask permission before changing plan**: Always ask for user permission before modifying the original plan or approach
- **Confirm major changes**: Get explicit approval before making significant architectural or design changes
- **Stay focused**: Stick to the current task unless explicitly asked to change direction

### Project Specific
- **Filter functionality**: The useFilteredBookmarks hook handles all filtering logic
- **Store management**: Use Zustand stores properly with correct TypeScript types
- **X/Twitter integration**: Handle X bookmark data transformation correctly
- **Media handling**: Use LazyImage component for all image loading

## Commands to run
- Tests: `npm test`
- Type check: `npm run typecheck`
- Lint: `npm run lint`
- Dev server: `npm run dev`

## Current Issues to Watch
- Filter UI components need to properly call store setters
- Chakra UI v3 compatibility across all components
- Test coverage for all major functionality