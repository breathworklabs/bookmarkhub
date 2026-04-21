import type { Preview } from '@storybook/react-vite'
import React from 'react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { MemoryRouter } from 'react-router-dom'
import { ModalProvider } from '../../src/components/modals/ModalProvider'

// Combined decorator to wrap stories with all necessary providers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withProviders = (Story: any) => (
  <DndProvider backend={HTML5Backend}>
    <MemoryRouter>
      <ChakraProvider value={defaultSystem}>
        <ModalProvider>
          <Story />
        </ModalProvider>
      </ChakraProvider>
    </MemoryRouter>
  </DndProvider>
)

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: [],
        includeName: true,
      },
    },
  },
  decorators: [withProviders],
}

export default preview
