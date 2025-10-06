import { ChakraProvider, defaultSystem, Box, Spinner, Text, VStack } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import XBookmarkManager from './components/XBookmarkManager'
import OnboardingScreen from './components/OnboardingScreen'
import SettingsPage from './components/SettingsPage'
import { useInitializeApp } from './hooks/useInitializeApp'
import { ModalProvider } from './components/modals/ModalProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
// import { AuthDebug } from './components/debug/AuthDebug'

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(0, 0, 0, 0.9)',
              color: '#e1e5e9',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '20px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 0 20px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              minWidth: '300px',
            },
          }}
          containerStyle={{
            top: '20px',
            right: '20px',
          }}
        />
        <ErrorBoundary context="App">
          <ModalProvider>
            <Routes>
              <Route path="/" element={<AppContent />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </ModalProvider>
        </ErrorBoundary>
      </BrowserRouter>
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