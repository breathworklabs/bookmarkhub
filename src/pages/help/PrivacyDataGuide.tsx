import { Box, VStack, HStack, Text } from '@chakra-ui/react'
import { Alert } from '@chakra-ui/react'
import { LuShield } from 'react-icons/lu'

export const PrivacyDataGuide = () => {
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
          Privacy & Data
        </Text>
        <Text
          fontSize="sm"
          style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
        >
          BookmarksX is built with privacy as the foundation. Your data never
          leaves your device, and we collect nothing.
        </Text>
      </Box>

      {/* 100% Local Storage */}
      <Box>
        <HStack gap={2} mb={3}>
          <LuShield size={20} color="var(--color-blue)" />
          <Text
            fontSize="lg"
            fontWeight="600"
            style={{ color: 'var(--color-text-primary)' }}
          >
            100% Local Storage
          </Text>
        </HStack>

        <VStack alignItems="stretch" gap={4}>
          <Alert.Root status="success" variant="subtle">
            <Alert.Indicator />
            <VStack alignItems="stretch" gap={2}>
              <Alert.Title>Privacy Guarantee</Alert.Title>
              <Alert.Description>
                <VStack alignItems="stretch" gap={2}>
                  <Text fontSize="sm" lineHeight="1.6">
                    All your data is stored in browser localStorage on your
                    device. No cloud storage, no external servers, no database.
                  </Text>
                  <Text fontSize="sm" lineHeight="1.6">
                    Your bookmarks, tags, collections, and settings stay
                    completely private. We literally cannot access your data
                    because it never reaches us.
                  </Text>
                </VStack>
              </Alert.Description>
            </VStack>
          </Alert.Root>

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
                What This Means For You
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Your data never leaves your device
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • No account required, no sign-up, no login
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • No third parties can access your bookmarks
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • No data breaches are possible
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Complete control over your data
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* No Tracking */}
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
          Zero Tracking
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
                What We DON'T Collect
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ✗ Personal information
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ✗ Browsing history
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ✗ Usage patterns or analytics
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ✗ IP addresses or device information
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ✗ Cookies or fingerprinting
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ✗ Anything at all
                </Text>
              </VStack>
              <Text
                fontSize="sm"
                fontWeight="600"
                style={{ color: 'var(--color-blue)' }}
              >
                No analytics. No tracking. No telemetry. Period.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Data Portability */}
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
          Data Portability
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
                You Own Your Data
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Export your data anytime in standard formats (JSON, CSV, HTML).
                No vendor lock-in, no export fees, no restrictions. Transfer
                between devices, share with others, or migrate to other tools
                freely.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Data Security */}
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
          Data Security
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
                Built-In Protection
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Input Sanitization:</strong> All user input is
                  sanitized to prevent XSS
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>React Protection:</strong> React's built-in XSS
                  prevention
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Content Security Policy:</strong> Strict CSP headers
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>No SQL Injection:</strong> No database means no SQL
                  injection risk
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Data Management */}
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
          Data Management
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
                Storage Usage
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                View your current storage usage in Settings. Most browsers
                provide 5-10MB of localStorage space. Monitor usage if you have
                large bookmark collections with extensive media.
              </Text>
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
                Clear All Data
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Available in Settings with confirmation required. Permanently
                deletes all bookmarks, collections, tags, and settings. Export
                before clearing! This action cannot be undone.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Backup Best Practices */}
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
          Backup Best Practices
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
                Recommended Backup Strategy
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Export data weekly or monthly as backup
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Store exports in multiple secure locations
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Version your exports with dates in filename
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Test restore process occasionally
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Keep at least 2-3 recent backup versions
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Browser Compatibility */}
      <Box>
        <Alert.Root status="info" variant="subtle">
          <Alert.Indicator />
          <VStack alignItems="stretch" gap={2}>
            <Alert.Title>Browser Compatibility</Alert.Title>
            <Alert.Description>
              <Text fontSize="sm" lineHeight="1.6">
                BookmarksX works in all modern browsers with localStorage
                support (Chrome, Firefox, Safari, Edge). Note: Private/Incognito
                mode may have storage limitations that affect functionality.
              </Text>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>
    </VStack>
  )
}
