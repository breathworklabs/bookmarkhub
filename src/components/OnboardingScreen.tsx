import { Box, Flex, VStack, Text, Button, HStack, Link } from '@chakra-ui/react'
import {
  LuImport,
  LuBookmarkPlus,
  LuFolderOpen,
  LuDownload,
  LuSparkles,
} from 'react-icons/lu'
import toast from 'react-hot-toast'
import { componentStyles } from '../styles/components'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useSettingsStore } from '../store/settingsStore'
import { logger } from '../lib/logger'
import { CHROME_EXTENSION_URL } from '../constants/app'

const OnboardingScreen = () => {
  const loadDemoData = useBookmarkStore((state) => state.loadDemoData)
  const setHasSeenSplash = useSettingsStore((state) => state.setHasSeenSplash)

  const handleFileChosen = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      logger.debug('Import file parsed', {
        context: {
          isArray: Array.isArray(data),
          hasBookmarks: !!data?.bookmarks,
          firstItem: Array.isArray(data) ? data[0] : null
        }
      })

      let importedCount = 0
      if (
        Array.isArray(data) &&
        data.length > 0 &&
        (data as any)[0].tweet_id &&
        (data as any)[0].username
      ) {
        // X/Twitter bookmarks from extension
        logger.debug('Detected X/Twitter bookmark format, importing...')
        await useBookmarkStore.getState().importXBookmarks(data)
        importedCount = data.length
        logger.debug(`Import completed: ${importedCount} bookmarks`)
      } else if (data?.bookmarks && Array.isArray(data.bookmarks)) {
        // BookmarkHub export format
        logger.debug('Detected BookmarkHub export format, importing...')
        await useBookmarkStore.getState().importBookmarks(file)
        importedCount = data.bookmarks.length
        logger.debug(`Import completed: ${importedCount} bookmarks`)
      } else {
        throw new Error('Invalid file format. Please select a valid bookmark export file.')
      }

      // Validate that bookmarks were actually imported
      if (importedCount === 0) {
        throw new Error('No bookmarks found in the selected file.')
      }

      // Verify data is in localStorage before reloading
      const storedData = localStorage.getItem('x-bookmark-manager-data')
      const parsed = storedData ? JSON.parse(storedData) : null
      const actualCount = parsed?.bookmarks?.length || 0
      logger.debug(`Verified localStorage: ${actualCount} bookmarks stored`)

      if (actualCount === 0) {
        throw new Error('Import succeeded but bookmarks were not saved to storage. Please try again.')
      }

      // Mark that user has seen the splash page BEFORE reloading
      // This prevents redirect to /welcome after reload
      setHasSeenSplash(true)

      // Ensure settings are persisted to localStorage immediately
      await new Promise(resolve => setTimeout(resolve, 100))

      // Show success toast
      const message =
        importedCount === 1
          ? '✓ Imported 1 bookmark successfully!'
          : `✓ Imported ${importedCount} bookmarks successfully!`

      logger.debug('Showing success toast, will reload in 2.5s')
      toast.success(message, { duration: 2000 })

      // Wait for toast to show, then reload using hard reload
      const reloadTimeout = setTimeout(() => {
        logger.debug('Reloading page after successful import')
        // Use hard reload to bypass cache and ensure fresh data
        window.location.href = window.location.origin
      }, 2500)

      logger.debug('Reload timeout scheduled', { timeoutId: reloadTimeout })
    } catch (error) {
      logger.error('Import failed', { error })
      toast.error(
        `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  const handleTryDemo = async () => {
    try {
      await loadDemoData()
      // Modal will be shown in XBookmarkManager after transition
    } catch (error) {
      logger.error('Failed to load demo data', { error })
      toast.error('Failed to load demo data. Please try again.')
    }
  }

  return (
    <Box
      {...componentStyles.container.background}
      w="100vw"
      data-testid="onboarding-screen"
    >
      {/* hidden file input for E2E */}
      <input
        type="file"
        accept=".json"
        data-testid="import-input"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            await handleFileChosen(file)
          }
        }}
      />
      <Flex
        h="100vh"
        w="100vw"
        direction="column"
        align="center"
        justify="center"
        textAlign="center"
        gap={8}
        px={4}
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        <Box style={{ color: 'var(--color-blue)' }} fontSize="6xl">
          <LuFolderOpen />
        </Box>
        <VStack gap={3}>
          <Text
            fontSize="2xl"
            fontWeight="600"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Welcome to BookmarkHub
          </Text>
          <Text fontSize="lg" maxW="550px" lineHeight="1.6">
            Your privacy-first bookmark manager for X/Twitter. Get started by
            exploring the demo or importing your bookmarks.
          </Text>
        </VStack>

        {/* Primary Action - Try Demo */}
        <VStack gap={6} w="100%" maxW="600px">
          <Button
            size="lg"
            h="auto"
            py={5}
            px={8}
            w={{ base: '100%', sm: 'auto' }}
            minW={{ sm: '320px' }}
            style={{
              background:
                'linear-gradient(135deg, var(--color-blue) 0%, #3b82f6 100%)',
            }}
            color="white"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(29, 78, 216, 0.35)',
            }}
            _active={{
              transform: 'translateY(0)',
            }}
            transition="all 0.3s ease"
            onClick={handleTryDemo}
          >
            <VStack gap={1} align="center">
              <HStack gap={2} fontSize="xl" fontWeight="600">
                <LuSparkles size={24} />
                <Text>Try Demo</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="400" opacity={0.9}>
                See how it works with sample posts
              </Text>
            </VStack>
          </Button>

          {/* Divider */}
          <Flex align="center" gap={3} w="100%">
            <Box h="1px" flex="1" bg="var(--color-border)" />
            <Text fontSize="sm" color="var(--color-text-tertiary)">
              or
            </Text>
            <Box h="1px" flex="1" bg="var(--color-border)" />
          </Flex>

          {/* Secondary Actions */}
          <VStack gap={3} w="100%">
            <HStack
              gap={3}
              flexWrap="wrap"
              justify="center"
              w="100%"
              align="stretch"
            >
              <Button
                size="md"
                flex={{ base: '1 1 100%', sm: '1' }}
                minW={{ sm: '150px' }}
                style={{
                  borderColor: 'var(--color-blue)',
                  color: 'var(--color-blue)',
                }}
                variant="outline"
                _hover={{
                  bg: 'var(--color-blue)',
                  transform: 'translateY(-1px)',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s ease"
                onClick={() => {
                  const input = document.querySelector(
                    'input[data-testid="import-input"]'
                  ) as HTMLInputElement | null
                  input?.click()
                }}
                css={{
                  '&:hover, &:hover *': {
                    color: 'white !important',
                  },
                }}
              >
                <HStack gap={2}>
                  <LuImport />
                  <Text>Import Bookmarks</Text>
                </HStack>
              </Button>
              <Button
                size="md"
                flex={{ base: '1 1 100%', sm: '1' }}
                minW={{ sm: '150px' }}
                style={{
                  borderColor: 'var(--color-blue)',
                  color: 'var(--color-blue)',
                }}
                variant="outline"
                _hover={{
                  bg: 'var(--color-blue)',
                  transform: 'translateY(-1px)',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s ease"
                onClick={() => window.open(CHROME_EXTENSION_URL, '_blank')}
                css={{
                  '&:hover, &:hover *': {
                    color: 'white !important',
                  },
                }}
              >
                <HStack gap={2}>
                  <LuDownload />
                  <Text>Install Extension</Text>
                </HStack>
              </Button>
            </HStack>

            {/* Tertiary Action - Add Manually */}
            <Link
              fontSize="sm"
              style={{ color: 'var(--color-text-tertiary)' }}
              _hover={{
                color: 'var(--color-blue)',
                textDecoration: 'underline',
              }}
              cursor="pointer"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <LuBookmarkPlus size={16} />
              <Text>Add bookmark manually</Text>
            </Link>
          </VStack>
        </VStack>
      </Flex>
    </Box>
  )
}

export default OnboardingScreen
