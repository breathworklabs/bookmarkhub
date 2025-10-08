import { Box, Flex, VStack, Text, Button, HStack } from '@chakra-ui/react';
import { LuImport, LuBookmarkPlus, LuFolderOpen } from 'react-icons/lu';
import { componentStyles } from '../styles/components';
import { useBookmarkStore } from '../store/bookmarkStore';

const OnboardingScreen = () => {
  const handleFileChosen = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (Array.isArray(data) && data.length > 0 && (data as any)[0].tweet_id && (data as any)[0].username) {
        await useBookmarkStore.getState().importXBookmarks(data)
      } else {
        await useBookmarkStore.getState().importBookmarks(file)
      }
    } catch (error) {
      console.error('Import failed:', error)
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <Box {...componentStyles.container.background} w="100vw" data-testid="onboarding-screen">
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
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        <Box style={{ color: 'var(--color-blue)' }} fontSize="6xl">
          <LuFolderOpen />
        </Box>
        <VStack gap={3}>
          <Text fontSize="2xl" fontWeight="600" style={{ color: 'var(--color-text-primary)' }}>
            No bookmarks yet
          </Text>
          <Text fontSize="lg" maxW="500px">
            Get started by importing your existing bookmarks or adding new ones manually.
          </Text>
        </VStack>
        <HStack gap={4}>
          <Button
            size="lg"
            style={{ background: 'var(--color-blue)' }}
            color="white"
            _hover={{ bg: "var(--color-blue-hover)" }}
            onClick={() => {
              const input = document.querySelector('input[data-testid="import-input"]') as HTMLInputElement | null
              input?.click()
            }}
          >
            <HStack gap={2}>
              <LuImport />
              <Text>Import Bookmarks</Text>
            </HStack>
          </Button>
          <Button
            size="lg"
            variant="outline"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            _hover={{ bg: "var(--color-border)", borderColor: "var(--color-border-hover)" }}
          >
            <HStack gap={2}>
              <LuBookmarkPlus />
              <Text>Add Bookmark</Text>
            </HStack>
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default OnboardingScreen;