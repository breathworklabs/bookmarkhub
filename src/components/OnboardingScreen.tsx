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
import { logger } from '../lib/logger'
import { CHROME_EXTENSION_URL } from '../constants/app'

const OnboardingScreen = () => {
  const loadDemoData = useBookmarkStore((state) => state.loadDemoData)

  const handleFileChosen = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      let importedCount = 0
      if (
        Array.isArray(data) &&
        data.length > 0 &&
        (data as any)[0].tweet_id &&
        (data as any)[0].username
      ) {
        await useBookmarkStore.getState().importXBookmarks(data)
        importedCount = data.length
      } else {
        await useBookmarkStore.getState().importBookmarks(file)
        // Get count from the imported data
        const imported = data?.bookmarks || []
        importedCount = Array.isArray(imported) ? imported.length : 0
      }

      // Show success toast and auto-refresh
      const message =
        importedCount === 1
          ? '✓ Imported 1 bookmark successfully. Refreshing...'
          : `✓ Imported ${importedCount} bookmarks successfully. Refreshing...`

      toast.success(message, { duration: 2500 })

      // Auto-refresh after showing toast
      setTimeout(() => {
        window.location.reload()
      }, 2500)
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
