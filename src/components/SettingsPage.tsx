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

  return (
    <DndProvider backend={HTML5Backend}>
      <Flex h="100vh" w="100vw">
        {/* Sidebar */}
        <UnifiedSidebar />

      {/* Main Content */}
      <Flex flex={1} direction="column" w="100%" overflowY="auto" p={8} bg="#0a0e1a">
        <Box maxW="800px" mx="auto" w="100%">
          {/* Back Button */}
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            color="#71767b"
            _hover={{ color: '#e1e5e9', bg: '#1c1f26' }}
            mb={6}
            size="sm"
          >
            <LuArrowLeft size={18} style={{ marginRight: '8px' }} />
            Back to Bookmarks
          </Button>

          {/* Settings Card */}
          <Box
            bg="#1c1f26"
            borderRadius="12px"
            border="1px solid #2a2d35"
            overflow="hidden"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
          >
            {/* Header */}
            <HStack p={6} borderBottomWidth="1px" borderColor="#2a2d35">
              <Text fontSize="16px">⚙️</Text>
              <Text fontSize="xl" fontWeight="600" color="#e1e5e9">
                Settings
              </Text>
            </HStack>

            {/* Content */}
            <VStack alignItems="stretch" p={6} gap={6}>
              {/* Extension Integration Section */}
              <Box>
                <HStack mb={4} gap={2}>
                  <LuRefreshCw size={16} color="#e1e5e9" />
                  <Text fontSize="sm" fontWeight="600" color="#e1e5e9">
                    Extension Integration
                  </Text>
                </HStack>

                <Box p={4} bg="#15171c" borderRadius="8px" border="1px solid #2a2d35">
                  <VStack alignItems="stretch" gap={4}>
                    {/* Auto-Sync Interval */}
                    <VStack alignItems="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="500" color="#e1e5e9">
                        Auto-Sync Interval
                      </Text>
                      <Text fontSize="xs" color="#71767b" lineHeight="1.4" mb={1}>
                        Automatically sync bookmarks from the extension at regular intervals
                      </Text>
                      <SelectRoot
                        collection={syncIntervalOptions}
                        value={[extensionSettings.autoSyncInterval]}
                        onValueChange={(e: any) => setAutoSyncInterval(e.value[0] as any)}
                        size="sm"
                      >
                        <SelectTrigger
                          bg="#1c1f26"
                          borderColor="#2a2d35"
                          color="#e1e5e9"
                          fontSize="13px"
                          _hover={{ borderColor: '#3a3d45' }}
                        >
                          <SelectValueText placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent bg="#1c1f26" borderColor="#2a2d35">
                          {syncIntervalOptions.items.map((option) => (
                            <SelectItem
                              key={option.value}
                              item={option.value}
                              color="#e1e5e9"
                              _hover={{ bg: '#2a2d35' }}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                    </VStack>

                    {/* Divider */}
                    <Box h="1px" bg="#2a2d35" />

                    {/* Sync Notifications */}
                    <HStack justifyContent="space-between">
                      <VStack alignItems="flex-start" gap={1} flex={1}>
                        <Text fontSize="sm" fontWeight="500" color="#e1e5e9">
                          Sync Notifications
                        </Text>
                        <Text fontSize="xs" color="#71767b" lineHeight="1.4">
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
                          bg={extensionSettings.syncNotifications ? '#1d4ed8' : '#2a2d35'}
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
                    <Box h="1px" bg="#2a2d35" />

                    {/* Default Tags */}
                    <VStack alignItems="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="500" color="#e1e5e9">
                        Default Tags
                      </Text>
                      <Text fontSize="xs" color="#71767b" lineHeight="1.4" mb={1}>
                        Automatically add these tags to all imported bookmarks (comma-separated)
                      </Text>
                      <Input
                        value={extensionSettings.defaultTags.join(', ')}
                        onChange={handleDefaultTagsChange}
                        placeholder="e.g. imported, twitter, reading-list"
                        size="sm"
                        bg="#1c1f26"
                        borderColor="#2a2d35"
                        color="#e1e5e9"
                        fontSize="13px"
                        _placeholder={{ color: '#71767b' }}
                        _hover={{ borderColor: '#3a3d45' }}
                        _focus={{ borderColor: '#1d4ed8', boxShadow: '0 0 0 1px #1d4ed8' }}
                      />
                    </VStack>

                    {/* Divider */}
                    <Box h="1px" bg="#2a2d35" />

                    {/* Import Duplicates Handling */}
                    <VStack alignItems="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="500" color="#e1e5e9">
                        Handle Duplicate Bookmarks
                      </Text>
                      <Text fontSize="xs" color="#71767b" lineHeight="1.4" mb={1}>
                        What to do when importing a bookmark that already exists
                      </Text>
                      <SelectRoot
                        collection={duplicateHandlingOptions}
                        value={[extensionSettings.importDuplicates]}
                        onValueChange={(e: any) => setImportDuplicates(e.value[0] as any)}
                        size="sm"
                      >
                        <SelectTrigger
                          bg="#1c1f26"
                          borderColor="#2a2d35"
                          color="#e1e5e9"
                          fontSize="13px"
                          _hover={{ borderColor: '#3a3d45' }}
                        >
                          <SelectValueText placeholder="Select handling" />
                        </SelectTrigger>
                        <SelectContent bg="#1c1f26" borderColor="#2a2d35">
                          {duplicateHandlingOptions.items.map((option) => (
                            <SelectItem
                              key={option.value}
                              item={option.value}
                              color="#e1e5e9"
                              _hover={{ bg: '#2a2d35' }}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                    </VStack>

                    {/* Divider */}
                    <Box h="1px" bg="#2a2d35" />

                    {/* Auto-Open App */}
                    <HStack justifyContent="space-between">
                      <VStack alignItems="flex-start" gap={1} flex={1}>
                        <Text fontSize="sm" fontWeight="500" color="#e1e5e9">
                          Auto-Open App After Import
                        </Text>
                        <Text fontSize="xs" color="#71767b" lineHeight="1.4">
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
                          bg={extensionSettings.autoOpenApp ? '#1d4ed8' : '#2a2d35'}
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
                  </VStack>
                </Box>
              </Box>

              {/* Data Management Section */}
              <Box>
                <Text fontSize="sm" fontWeight="600" color="#e1e5e9" mb={4}>
                  Data Management
                </Text>

                <Box p={4} bg="#15171c" borderRadius="8px" border="1px solid #2a2d35">
                  <VStack alignItems="stretch" gap={3}>
                    <VStack alignItems="flex-start" gap={1}>
                      <Text fontSize="sm" fontWeight="500" color="#e1e5e9">
                        Clear All Data
                      </Text>
                      <Text fontSize="xs" color="#71767b" lineHeight="1.4">
                        Delete all bookmarks, collections, and settings. This action cannot be undone.
                      </Text>
                    </VStack>

                    <Button
                      onClick={handleClearAllData}
                      size="sm"
                      bg="#dc2626"
                      color="white"
                      _hover={{ bg: '#b91c1c' }}
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
              <Box p={3} bg="#15171c" borderRadius="8px" border="1px solid #2a2d35">
                <Text fontSize="xs" color="#71767b" lineHeight="1.6">
                  💡 <strong style={{ color: '#9ca3af' }}>Tip:</strong> After clearing data, you can
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
