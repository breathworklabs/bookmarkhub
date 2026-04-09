import { Box, VStack, Text } from '@chakra-ui/react'
import { Alert } from '@chakra-ui/react'

export const SettingsGuide = () => {
  return (
    <VStack alignItems="stretch" gap={6}>
      {/* Introduction */}
      <Box>
        <Text
          fontSize="xl"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Settings
        </Text>
        <Text
          fontSize="sm"
          style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
        >
          Customize BookmarksX to match your preferences. Configure display,
          privacy, import/export, and accessibility settings.
        </Text>
      </Box>

      {/* Display Settings */}
      <Box>
        <Text
          fontSize="lg"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Display Settings
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <VStack alignItems="stretch" gap={3}>
              <Text
                fontSize="sm"
                fontWeight="600"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Theme & Appearance
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Theme:</strong> Dark mode, light mode, or auto
                  (follows system)
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Font Size:</strong> Small, medium, or large
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>View Mode:</strong> Grid, list, or compact view
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Cards Per Page:</strong> 10, 20, 30, 50, or 100
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Animations:</strong> Enable or disable for
                  performance
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Sidebar State:</strong> Collapsed or expanded by
                  default
                </Text>
              </VStack>
            </VStack>
          </Box>

          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <VStack alignItems="stretch" gap={2}>
              <Text
                fontSize="sm"
                fontWeight="600"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Media Preview Mode
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Control how media is displayed: Auto (show all), click to load
                (privacy mode), or off (no previews). Click to load prevents
                automatic connections to media servers.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Extension Settings */}
      <Box
        p={1}
        style={{ background: 'var(--color-border)' }}
        borderRadius="8px"
      />

      <Box>
        <Text
          fontSize="lg"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Extension Settings
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <VStack alignItems="stretch" gap={2}>
              <Text
                fontSize="sm"
                fontWeight="600"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Browser Extension Configuration
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Auto-Sync:</strong> Set sync interval (5min, 15min,
                  30min, hourly, or off)
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Default Tags:</strong> Auto-applied to new bookmarks
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Default Collection:</strong> Where new bookmarks are
                  saved
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Auto-Open App:</strong> Open BookmarksX when saving
                  bookmarks
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Privacy Settings */}
      <Box
        p={1}
        style={{ background: 'var(--color-border)' }}
        borderRadius="8px"
      />

      <Box>
        <Text
          fontSize="lg"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Privacy Settings
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <VStack alignItems="stretch" gap={3}>
              <Alert.Root status="success" variant="subtle">
                <Alert.Indicator />
                <VStack alignItems="stretch" gap={1}>
                  <Alert.Title>Privacy First</Alert.Title>
                  <Alert.Description>
                    <Text fontSize="sm" lineHeight="1.6">
                      BookmarksX collects NO analytics. All data stays on your
                      device.
                    </Text>
                  </Alert.Description>
                </VStack>
              </Alert.Root>
              <Text
                fontSize="sm"
                fontWeight="600"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Available Privacy Controls
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Search History:</strong> Enable/disable or clear
                  search history
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Data Storage:</strong> View storage usage and
                  location
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Clear All Data:</strong> Permanently delete
                  everything (with confirmation)
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Import/Export Settings */}
      <Box
        p={1}
        style={{ background: 'var(--color-border)' }}
        borderRadius="8px"
      />

      <Box>
        <Text
          fontSize="lg"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Import/Export Settings
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <VStack alignItems="stretch" gap={2}>
              <Text
                fontSize="sm"
                fontWeight="600"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Default Preferences
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Duplicate Handling:</strong> Skip, replace, or keep
                  both
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Export Format:</strong> Preferred format (JSON, CSV,
                  HTML)
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Include Deleted:</strong> Whether to include trash
                  in exports
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Include Media URLs:</strong> Whether to include
                  media in exports
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Accessibility */}
      <Box
        p={1}
        style={{ background: 'var(--color-border)' }}
        borderRadius="8px"
      />

      <Box>
        <Text
          fontSize="lg"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Accessibility Settings
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <VStack alignItems="stretch" gap={2}>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Keyboard Shortcuts:</strong> Enable/disable and view
                  reference
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Screen Reader Support:</strong> ARIA labels and
                  semantic HTML
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Reduced Motion:</strong> Respect system preference
                  for animations
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Focus Management:</strong> Clear focus indicators
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Tips */}
      <Box>
        <Alert.Root status="info" variant="subtle">
          <Alert.Indicator />
          <VStack alignItems="stretch" gap={2}>
            <Alert.Title>Settings Tips</Alert.Title>
            <Alert.Description>
              <VStack alignItems="stretch" gap={2}>
                <Text fontSize="sm" lineHeight="1.6">
                  • Settings are saved automatically in localStorage
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Export settings with your data for transfer to other devices
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Try compact view for more bookmarks on screen
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Disable animations if experiencing performance issues
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Use click-to-load media for privacy when browsing publicly
                </Text>
              </VStack>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>
    </VStack>
  )
}
