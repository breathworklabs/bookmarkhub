import { ChakraProvider, defaultSystem, Box, Spinner, Text, VStack } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import XBookmarkManager from './components/XBookmarkManager'
import OnboardingScreen from './components/OnboardingScreen'
import SettingsPage from './components/SettingsPage'
import TrashView from './components/TrashView'
import { useInitializeApp } from './hooks/useInitializeApp'
import { ModalProvider } from './components/modals/ModalProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'
// import { AuthDebug } from './components/debug/AuthDebug'

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <ThemeProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '20px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 8px 24px var(--color-card-shadow)',
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
                <Route path="/trash" element={<TrashView />} />
              </Routes>
            </ModalProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </ThemeProvider>
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
        bg="var(--color-bg-primary)"
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
        bg="var(--color-bg-primary)"
      >
        <VStack gap={4}>
          <Spinner size="lg" color="var(--color-blue)" />
          <Text color="var(--color-text-primary)" fontSize="sm">
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
        bg="var(--color-bg-primary)"
      >
        <VStack gap={4} maxW="400px" textAlign="center">
          <Text color="var(--color-error)" fontSize="lg" fontWeight="600">
            Initialization Error
          </Text>
          <Text color="var(--color-text-tertiary)" fontSize="sm">
            {error}
          </Text>
          <Text color="var(--color-text-tertiary)" fontSize="xs">
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