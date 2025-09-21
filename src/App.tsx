import { ChakraProvider, defaultSystem, Box, Spinner, Text, VStack } from '@chakra-ui/react'
import XBookmarkManager from './components/XBookmarkManager'
import { useInitializeApp } from './hooks/useInitializeApp'

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <AppContent />
    </ChakraProvider>
  )
}

function AppContent() {
  const { isLoading, error } = useInitializeApp()

  if (isLoading) {
    return (
      <Box
        h="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="#0a0e1a"
      >
        <VStack gap={4}>
          <Spinner size="lg" color="#1d4ed8" />
          <Text color="#e1e5e9" fontSize="sm">
            Initializing X Bookmark Manager...
          </Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        h="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="#0a0e1a"
      >
        <VStack gap={4} maxW="400px" textAlign="center">
          <Text color="#ef4444" fontSize="lg" fontWeight="600">
            Initialization Error
          </Text>
          <Text color="#71767b" fontSize="sm">
            {error}
          </Text>
          <Text color="#71767b" fontSize="xs">
            Using offline mode with sample data
          </Text>
        </VStack>
      </Box>
    )
  }

  return <XBookmarkManager />
}

export default App