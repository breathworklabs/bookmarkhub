import { ChakraProvider, defaultSystem, Box, Spinner, Text, VStack } from '@chakra-ui/react'
import XBookmarkManager from './components/XBookmarkManager'
import OnboardingScreen from './components/OnboardingScreen'
import { useInitializeApp } from './hooks/useInitializeApp'
import { ModalProvider } from './components/modals/ModalProvider'
// import { AuthDebug } from './components/debug/AuthDebug'

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <ModalProvider>
        <AppContent />
      </ModalProvider>
    </ChakraProvider>
  )
}

function AppContent() {
  const { isLoading, error, hasExistingBookmarks } = useInitializeApp()

  // Still checking localStorage - show minimal loading
  if (hasExistingBookmarks === null) {
    return (
      <Box
        h="100vh"
        w="100vw"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="#0a0e1a"
      >
        <Spinner size="lg" color="#1d4ed8" />
      </Box>
    )
  }

  // Loading existing bookmarks
  if (isLoading) {
    return (
      <Box
        h="100vh"
        w="100vw"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="#0a0e1a"
      >
        <VStack gap={4}>
          <Spinner size="lg" color="#1d4ed8" />
          <Text color="#e1e5e9" fontSize="sm">
            Loading your bookmarks...
          </Text>
        </VStack>
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box
        h="100vh"
        w="100vw"
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

  // No existing bookmarks - show onboarding/import screen
  if (hasExistingBookmarks === false) {
    return <OnboardingScreen />
  }

  // Has existing bookmarks - show main app
  return (
    <>
      <XBookmarkManager />
      {/* <AuthDebug /> */}
    </>
  )
}

export default App