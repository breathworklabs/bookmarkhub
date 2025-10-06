import { Box, Flex, VStack, Text, Button, HStack, Input, createListCollection } from '@chakra-ui/react'
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@chakra-ui/react/select'
import { LuTrash2, LuArrowLeft, LuRefreshCw } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import toast from 'react-hot-toast'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useSettingsStore } from '../store/settingsStore'
import { useCollectionsStore } from '../store/collectionsStore'
import UnifiedSidebar from './UnifiedSidebar'

const SettingsPage = () => {
  const navigate = useNavigate()
  const clearAllData = useBookmarkStore((state) => state.clearAllData)

  // Extension settings
  const extensionSettings = useSettingsStore((state) => state.extension)
  const setAutoSyncInterval = useSettingsStore((state) => state.setAutoSyncInterval)
  const setSyncNotifications = useSettingsStore((state) => state.setSyncNotifications)
  const setDefaultTags = useSettingsStore((state) => state.setDefaultTags)
  const setImportDuplicates = useSettingsStore((state) => state.setImportDuplicates)
  const setAutoOpenApp = useSettingsStore((state) => state.setAutoOpenApp)
  const setDefaultCollection = useSettingsStore((state) => state.setDefaultCollection)

  // Display settings
  const displaySettings = useSettingsStore((state) => state.display)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const setSortBy = useSettingsStore((state) => state.setSortBy)

  // Collections
  const collections = useCollectionsStore((state) => state.collections)

  const handleClearAllData = async () => {
    if (!confirm('Clear all bookmarks and data? This cannot be undone.\n\nYou can re-import bookmarks from the Chrome extension.')) {
      return
    }

    try {
      await clearAllData()
      toast.success('All data cleared successfully')
      // Reload page to show onboarding
      setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      console.error('Failed to clear data:', error)
      toast.error('Failed to clear data')
    }
  }

  const handleDefaultTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
    setDefaultTags(tags)
  }

  // Create list collections for selects
  const syncIntervalOptions = createListCollection({
    items: [
      { label: 'Off (Manual only)', value: 'off' },
      { label: 'Every 5 minutes', value: '5min' },
      { label: 'Every 15 minutes', value: '15min' },
      { label: 'Every 30 minutes', value: '30min' },
      { label: 'Every hour', value: '1hour' },
      { label: 'Manual only', value: 'manual' },
    ],
  })

  const duplicateHandlingOptions = createListCollection({
    items: [
      { label: 'Skip duplicate (keep existing)', value: 'skip' },
      { label: 'Replace with new version', value: 'replace' },
      { label: 'Keep both versions', value: 'keep-both' },
    ],
  })

  const themeOptions = createListCollection({
    items: [
      { label: 'Dark', value: 'dark' },
      { label: 'Light', value: 'light' },
      { label: 'Auto (System)', value: 'auto' },
    ],
  })

  const collectionOptions = createListCollection({
    items: [
      { label: 'None (no default collection)', value: 'none' },
      ...collections.map(collection => ({
        label: collection.name,
        value: collection.id
      }))
    ],
  })

  const sortByOptions = createListCollection({
    items: [
      { label: 'Date (Newest first)', value: 'date' },
      { label: 'Title (A-Z)', value: 'title' },
      { label: 'Author (A-Z)', value: 'author' },
      { label: 'Domain (A-Z)', value: 'domain' },
    ],
  })

  return (
    <DndProvider backend={HTML5Backend}>
      <Flex h="100vh" w="100vw">
        {/* Sidebar */}
        <UnifiedSidebar />

      {/* Main Content */}
      <Flex flex={1} direction="column" w="100%" overflowY="auto" p={8} style={{ background: 'var(--color-bg-primary)' }}>
        <Box maxW="800px" mx="auto" w="100%">
          {/* Back Button */}
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            style={{ color: 'var(--color-text-tertiary)' }}
            _hover={{ color: 'var(--color-text-primary)', bg: '#1c1f26' }}
            mb={6}
            size="sm"
          >
            <LuArrowLeft size={18} style={{ marginRight: '8px' }} />
            Back to Bookmarks
          </Button>

          {/* Settings Card */}
          <Box
            style={{ background: 'var(--color-bg-tertiary)' }}
            borderRadius="12px"
            border="1px solid var(--color-border)"
            overflow="hidden"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
          >
            {/* Header */}
            <HStack p={6} borderBottomWidth="1px" style={{ borderColor: 'var(--color-border)' }}>
              <Text fontSize="16px">⚙️</Text>
              <Text fontSize="xl" fontWeight="600" style={{ color: 'var(--color-text-primary)' }}>
                Settings
              </Text>
            </HStack>

            {/* Content */}
            <VStack alignItems="stretch" p={6} gap={6}>
              {/* Extension Integration Section */}
              <Box>
                <HStack mb={4} gap={2}>
                  <LuRefreshCw size={16} style={{ color: 'var(--color-text-primary)' }} />
                  <Text fontSize="sm" fontWeight="600" style={{ color: 'var(--color-text-primary)' }}>
                    Extension Integration
                  </Text>
                </HStack>

                <Box p={4} style={{ background: 'var(--color-bg-secondary)' }} borderRadius="8px" border="1px solid var(--color-border)">
                  <VStack alignItems="stretch" gap={4}>
                    {/* Auto-Sync Interval */}
                    <VStack alignItems="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="500" style={{ color: 'var(--color-text-primary)' }}>
                        Auto-Sync Interval
                      </Text>
                      <Text fontSize="xs" style={{ color: 'var(--color-text-tertiary)' }} lineHeight="1.4" mb={1}>
                        Automatically sync bookmarks from the extension at regular intervals
                      </Text>
                      <SelectRoot
                        collection={syncIntervalOptions}
                        value={[extensionSettings.autoSyncInterval]}
                        onValueChange={(e: any) => setAutoSyncInterval(e.value[0] as any)}
                        size="sm"
                      >
                        <SelectTrigger
                          style={{ background: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                          fontSize="13px"
                          _hover={{ borderColor: 'var(--color-border-hover)' }}
                        >
                          <SelectValueText placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent style={{ background: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)' }}>
                          {syncIntervalOptions.items.map((option) => (
                            <SelectItem
                              key={option.value}
                              item={option.value}
                              style={{ color: 'var(--color-text-primary)' }}
                              _hover={{ bg: 'var(--color-bg-hover)' }}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                    </VStack>

                    {/* Divider */}
                    <Box h="1px" style={{ background: 'var(--color-border)' }} />

                    {/* Sync Notifications */}
                    <HStack justifyContent="space-between">
                      <VStack alignItems="flex-start" gap={1} flex={1}>
                        <Text fontSize="sm" fontWeight="500" style={{ color: 'var(--color-text-primary)' }}>
                          Sync Notifications
                        </Text>
                        <Text fontSize="xs" style={{ color: 'var(--color-text-tertiary)' }} lineHeight="1.4">
                          Show notifications when bookmarks are imported from the extension
                        </Text>
                      </VStack>
                      <Box
                        as="label"
                        position="relative"
                        display="inline-block"
                        w="44px"
                        h="24px"
                        cursor="pointer"
                      >
                        <input
                          type="checkbox"
                          checked={extensionSettings.syncNotifications}
                          onChange={(e) => setSyncNotifications(e.target.checked)}
                          style={{
                            opacity: 0,
                            width: 0,
                            height: 0,
                          }}
                        />
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          style={{ background: extensionSettings.syncNotifications ? 'var(--color-blue)' : 'var(--color-border)' }}
                          borderRadius="12px"
                          transition="all 0.2s"
                          _before={{
                            content: '""',
                            position: 'absolute',
                            height: '18px',
                            width: '18px',
                            left: extensionSettings.syncNotifications ? '23px' : '3px',
                            bottom: '3px',
                            bg: 'white',
                            borderRadius: '50%',
                            transition: 'all 0.2s',
                          }}
                        />
                      </Box>
                    </HStack>

                    {/* Divider */}
                    <Box h="1px" style={{ background: 'var(--color-border)' }} />

                    {/* Default Tags */}
                    <VStack alignItems="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="500" style={{ color: 'var(--color-text-primary)' }}>
                        Default Tags
                      </Text>
                      <Text fontSize="xs" style={{ color: 'var(--color-text-tertiary)' }} lineHeight="1.4" mb={1}>
                        Automatically add these tags to all imported bookmarks (comma-separated)
                      </Text>
                      <Input
                        value={extensionSettings.defaultTags.join(', ')}
                        onChange={handleDefaultTagsChange}
                        placeholder="e.g. imported, twitter, reading-list"
                        size="sm"
                        style={{ background: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        fontSize="13px"
                        _placeholder={{ color: 'var(--color-text-tertiary)' }}
                        _hover={{ borderColor: 'var(--color-border-hover)' }}
                        _focus={{ borderColor: 'var(--color-blue)', boxShadow: '0 0 0 1px var(--color-blue)' }}
                      />
                    </VStack>

                    {/* Divider */}
                    <Box h="1px" style={{ background: 'var(--color-border)' }} />

                    {/* Import Duplicates Handling */}
                    <VStack alignItems="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="500" style={{ color: 'var(--color-text-primary)' }}>
                        Handle Duplicate Bookmarks
                      </Text>
                      <Text fontSize="xs" style={{ color: 'var(--color-text-tertiary)' }} lineHeight="1.4" mb={1}>
                        What to do when importing a bookmark that already exists
                      </Text>
                      <SelectRoot
                        collection={duplicateHandlingOptions}
                        value={[extensionSettings.importDuplicates]}
                        onValueChange={(e: any) => setImportDuplicates(e.value[0] as any)}
                        size="sm"
                      >
                        <SelectTrigger
                          style={{ background: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                          fontSize="13px"
                          _hover={{ borderColor: 'var(--color-border-hover)' }}
                        >
                          <SelectValueText placeholder="Select handling" />
                        </SelectTrigger>
                        <SelectContent style={{ background: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)' }}>
                          {duplicateHandlingOptions.items.map((option) => (
                            <SelectItem
                              key={option.value}
                              item={option.value}
                              style={{ color: 'var(--color-text-primary)' }}
                              _hover={{ bg: 'var(--color-bg-hover)' }}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                    </VStack>

                    {/* Divider */}
                    <Box h="1px" style={{ background: 'var(--color-border)' }} />

                    {/* Auto-Open App */}
                    <HStack justifyContent="space-between">
                      <VStack alignItems="flex-start" gap={1} flex={1}>
                        <Text fontSize="sm" fontWeight="500" style={{ color: 'var(--color-text-primary)' }}>
                          Auto-Open App After Import
                        </Text>
                        <Text fontSize="xs" style={{ color: 'var(--color-text-tertiary)' }} lineHeight="1.4">
                          Automatically open the app when bookmarks are imported via extension
                        </Text>
                      </VStack>
                      <Box
                        as="label"
                        position="relative"
                        display="inline-block"
                        w="44px"
                        h="24px"
                        cursor="pointer"
                      >
                        <input
                          type="checkbox"
                          checked={extensionSettings.autoOpenApp}
                          onChange={(e) => setAutoOpenApp(e.target.checked)}
                          style={{
                            opacity: 0,
                            width: 0,
                            height: 0,
                          }}
                        />
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          style={{ background: extensionSettings.autoOpenApp ? 'var(--color-blue)' : 'var(--color-border)' }}
                          borderRadius="12px"
                          transition="all 0.2s"
                          _before={{
                            content: '""',
                            position: 'absolute',
                            height: '18px',
                            width: '18px',
                            left: extensionSettings.autoOpenApp ? '23px' : '3px',
                            bottom: '3px',
                            bg: 'white',
                            borderRadius: '50%',
                            transition: 'all 0.2s',
                          }}
                        />
                      </Box>
                    </HStack>

                    {/* Divider */}
                    <Box h="1px" style={{ background: 'var(--color-border)' }} />

                    {/* Default Collection */}
                    <VStack alignItems="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="500" style={{ color: 'var(--color-text-primary)' }}>
                        Default Collection for New Bookmarks
                      </Text>
                      <Text fontSize="xs" style={{ color: 'var(--color-text-tertiary)' }} lineHeight="1.4" mb={1}>
                        Automatically add new bookmarks to this collection
                      </Text>
                      <SelectRoot
                        collection={collectionOptions}
                        value={[extensionSettings.defaultCollection || 'none']}
                        onValueChange={(e: any) => setDefaultCollection(e.value[0] === 'none' ? null : e.value[0])}
                        size="sm"
                      >
                        <SelectTrigger
                          style={{ background: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                          fontSize="13px"
                          _hover={{ borderColor: 'var(--color-border-hover)' }}
                        >
                          <SelectValueText placeholder="Select collection" />
                        </SelectTrigger>
                        <SelectContent style={{ background: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)' }}>
                          {collectionOptions.items.map((option) => (
                            <SelectItem
                              key={option.value}
                              item={option.value}
                              style={{ color: 'var(--color-text-primary)' }}
                              _hover={{ bg: 'var(--color-bg-hover)' }}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                    </VStack>
                  </VStack>
                </Box>
              </Box>

              {/* Display & View Settings Section */}
              <Box>
                <Text fontSize="sm" fontWeight="600" style={{ color: 'var(--color-text-primary)' }} mb={4}>
                  Display & View
                </Text>

                <Box p={4} style={{ background: 'var(--color-bg-secondary)' }} borderRadius="8px" border="1px solid var(--color-border)">
                  <VStack alignItems="stretch" gap={2}>
                    <Text fontSize="sm" fontWeight="500" style={{ color: 'var(--color-text-primary)' }}>
                      Theme
                    </Text>
                    <Text fontSize="xs" style={{ color: 'var(--color-text-tertiary)' }} lineHeight="1.4" mb={1}>
                      Choose your preferred color theme
                    </Text>
                    <SelectRoot
                      collection={themeOptions}
                      value={[displaySettings.theme]}
                      onValueChange={(e: any) => setTheme(e.value[0] as any)}
                      size="sm"
                    >
                      <SelectTrigger
                        style={{ background: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        fontSize="13px"
                        _hover={{ borderColor: 'var(--color-border-hover)' }}
                      >
                        <SelectValueText placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent style={{ background: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)' }}>
                        {themeOptions.items.map((option) => (
                          <SelectItem
                            key={option.value}
                            item={option.value}
                            style={{ color: 'var(--color-text-primary)' }}
                            _hover={{ bg: 'var(--color-bg-hover)' }}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>

                    {/* Divider */}
                    <Box h="1px" style={{ background: 'var(--color-border)' }} />

                    {/* Sort By */}
                    <VStack alignItems="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="500" style={{ color: 'var(--color-text-primary)' }}>
                        Default Sorting
                      </Text>
                      <Text fontSize="xs" style={{ color: 'var(--color-text-tertiary)' }} lineHeight="1.4" mb={1}>
                        How bookmarks should be sorted by default
                      </Text>
                      <SelectRoot
                        collection={sortByOptions}
                        value={[displaySettings.sortBy]}
                        onValueChange={(e: any) => setSortBy(e.value[0] as any)}
                        size="sm"
                      >
                        <SelectTrigger
                          style={{ background: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                          fontSize="13px"
                          _hover={{ borderColor: 'var(--color-border-hover)' }}
                        >
                          <SelectValueText placeholder="Select sorting" />
                        </SelectTrigger>
                        <SelectContent style={{ background: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)' }}>
                          {sortByOptions.items.map((option) => (
                            <SelectItem
                              key={option.value}
                              item={option.value}
                              style={{ color: 'var(--color-text-primary)' }}
                              _hover={{ bg: 'var(--color-bg-hover)' }}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                    </VStack>
                  </VStack>
                </Box>
              </Box>

              {/* Data Management Section */}
              <Box>
                <Text fontSize="sm" fontWeight="600" style={{ color: 'var(--color-text-primary)' }} mb={4}>
                  Data Management
                </Text>

                <Box p={4} style={{ background: 'var(--color-bg-secondary)' }} borderRadius="8px" border="1px solid var(--color-border)">
                  <VStack alignItems="stretch" gap={3}>
                    <VStack alignItems="flex-start" gap={1}>
                      <Text fontSize="sm" fontWeight="500" style={{ color: 'var(--color-text-primary)' }}>
                        Clear All Data
                      </Text>
                      <Text fontSize="xs" style={{ color: 'var(--color-text-tertiary)' }} lineHeight="1.4">
                        Delete all bookmarks, collections, and settings. This action cannot be undone.
                      </Text>
                    </VStack>

                    <Button
                      onClick={handleClearAllData}
                      size="sm"
                      style={{ background: 'var(--color-error)' }}
                      color="white"
                      _hover={{ bg: 'var(--color-error-hover)' }}
                      fontWeight="500"
                      fontSize="13px"
                      h="36px"
                    >
                      <LuTrash2 size={16} style={{ marginRight: '8px' }} />
                      Clear All Data
                    </Button>
                  </VStack>
                </Box>
              </Box>

              {/* Info Section */}
              <Box p={3} style={{ background: 'var(--color-bg-secondary)' }} borderRadius="8px" border="1px solid var(--color-border)">
                <Text fontSize="xs" style={{ color: 'var(--color-text-tertiary)' }} lineHeight="1.6">
                  💡 <strong style={{ color: 'var(--color-text-secondary)' }}>Tip:</strong> After clearing data, you can
                  re-import your bookmarks using the Chrome extension.
                </Text>
              </Box>
            </VStack>
          </Box>
        </Box>
      </Flex>
    </Flex>
    </DndProvider>
  )
}

export default SettingsPage
