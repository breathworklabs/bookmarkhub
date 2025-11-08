# Storybook Setup

This project uses Storybook v9.1.10 for component documentation and development.

## Running Storybook

```bash
npm run storybook
```

This will start Storybook at [http://localhost:6006](http://localhost:6006)

## Building Storybook

```bash
npm run build-storybook
```

This will create a static build in the `storybook-static` directory.

## Configuration

### Decorators

The following decorators are automatically applied to all stories via [`.storybook/preview.tsx`](.storybook/preview.tsx):

- **MemoryRouter**: Provides React Router context
- **DndProvider**: Provides React DnD context for drag-and-drop components

### Addons

The following addons are configured:

- `@storybook/addon-essentials` - Essential Storybook addons (docs, controls, actions, etc.)
- `@storybook/addon-a11y` - Accessibility testing

## Writing Stories

Stories are located alongside their components with the `.stories.tsx` extension.

### Example Story Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import MyComponent from './MyComponent'

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MyComponent>

export const Default: Story = {
  args: {
    // component props
  },
}
```

## Example Stories

The following component stories have been created:

- **TagChip** ([`src/components/tags/TagChip.stories.tsx`](../src/components/tags/TagChip.stories.tsx))
  - Demonstrates different sizes, variants, and states
  - Shows interactive handlers for click and remove

- **LazyImage** ([`src/components/LazyImage.stories.tsx`](../src/components/LazyImage.stories.tsx))
  - Demonstrates image loading with different fit options
  - Shows loading states, error handling, and various shapes

- **BookmarkCard** ([`src/components/BookmarkCard/BookmarkCard.stories.tsx`](../src/components/BookmarkCard/BookmarkCard.stories.tsx))
  - Complex component showcasing different bookmark states
  - Demonstrates starred bookmarks, images, tags, and more

## Tips for Complex Components

### Components with Zustand Stores

For components that use Zustand stores, you may need to create custom decorators or mock store providers. Example:

```typescript
const withMockStore = (Story: any) => {
  // Reset store state before rendering
  useBookmarkStore.setState({ bookmarks: [] })
  return <Story />
}

export default {
  decorators: [withMockStore],
}
```

### Components with External Dependencies

If a component makes API calls or uses external services, consider:

1. Mocking the service layer
2. Using MSW (Mock Service Worker) for API mocking
3. Creating simplified versions of components for Storybook

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [React DnD Testing](https://react-dnd.github.io/react-dnd/docs/testing)
