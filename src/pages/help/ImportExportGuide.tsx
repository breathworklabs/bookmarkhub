import { Box, VStack, HStack, Text } from '@chakra-ui/react'
import { Alert } from '@chakra-ui/react'

export const ImportExportGuide = () => {
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
          Import & Export
        </Text>
        <Text
          fontSize="sm"
          style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
        >
          Full data portability with support for multiple formats. Import from
          X/Twitter, export to JSON, CSV, or HTML. Your data, your control.
        </Text>
      </Box>

      {/* Import from X/Twitter */}
      <Box>
        <Text
          fontSize="lg"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Import from X/Twitter
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
                Export from X/Twitter
              </Text>
              <VStack alignItems="stretch" gap={2} pl={3}>
                <HStack gap={2} alignItems="flex-start">
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-blue)' }}
                    fontWeight="600"
                  >
                    1.
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    Go to X/Twitter Settings and Privacy
                  </Text>
                </HStack>
                <HStack gap={2} alignItems="flex-start">
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-blue)' }}
                    fontWeight="600"
                  >
                    2.
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    Request your data archive
                  </Text>
                </HStack>
                <HStack gap={2} alignItems="flex-start">
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-blue)' }}
                    fontWeight="600"
                  >
                    3.
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    Download and extract the archive
                  </Text>
                </HStack>
                <HStack gap={2} alignItems="flex-start">
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-blue)' }}
                    fontWeight="600"
                  >
                    4.
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    Locate the bookmarks.json file
                  </Text>
                </HStack>
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
                Import into BookmarksX
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Click the "Import" button in the header, select "Import from
                X/Twitter", choose your bookmarks.json file, and configure
                duplicate handling preferences. All metadata, media, and
                engagement metrics are preserved!
              </Text>
              <Box
                mt={2}
                p={4}
                style={{ background: 'var(--color-bg-primary)' }}
                borderRadius="6px"
                border="1px dashed var(--color-border)"
                textAlign="center"
              >
                <Text
                  fontSize="xs"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  [GIF: Complete X/Twitter import process]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Duplicate Handling */}
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
          Duplicate Handling
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
                Automatic Duplicate Detection
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                BookmarksX automatically detects duplicates by URL during
                import. Choose how to handle them:
              </Text>
              <VStack alignItems="stretch" gap={2} pl={3}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Skip:</strong> Don't import duplicates (default,
                  safest)
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Replace:</strong> Update existing bookmark with new
                  data
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Keep Both:</strong> Import as separate bookmark
                </Text>
              </VStack>
              <Box
                mt={2}
                p={4}
                style={{ background: 'var(--color-bg-primary)' }}
                borderRadius="6px"
                border="1px dashed var(--color-border)"
                textAlign="center"
              >
                <Text
                  fontSize="xs"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  [Screenshot: Duplicate handling options]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Export Options */}
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
          Export Options
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
                Export to JSON
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Full-fidelity export with all metadata, views, tags, and
                settings. Perfect for backups or transferring to another device.
                Import back anytime without data loss.
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
                Export to CSV
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Spreadsheet-compatible format for Excel or Google Sheets. Great
                for analysis, reporting, or sharing with non-BookmarksX users.
                Includes title, URL, author, domain, tags, and more.
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
                Export to HTML
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Standard browser bookmark format. Import directly into Chrome,
                Firefox, Safari, or Edge. Views convert to folders. Note:
                Tags and metadata are not preserved in this format.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Tips */}
      <Box>
        <Alert.Root status="info" variant="subtle">
          <Alert.Indicator />
          <VStack alignItems="stretch" gap={2}>
            <Alert.Title>Import & Export Best Practices</Alert.Title>
            <Alert.Description>
              <VStack alignItems="stretch" gap={2}>
                <Text fontSize="sm" lineHeight="1.6">
                  • Export regularly as backup (weekly or monthly recommended)
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Use JSON format for complete data portability
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Store backup exports in multiple secure locations
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Version your exports with dates in filename
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Test imports on small datasets first
                </Text>
              </VStack>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>
    </VStack>
  )
}
