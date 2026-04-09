import { Box, VStack, HStack, Text, Code } from '@chakra-ui/react'
import { Alert } from '@chakra-ui/react'
import { LuSparkles } from 'react-icons/lu'

export const TagsFilteringGuide = () => {
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
          Tags & Filtering
        </Text>
        <Text
          fontSize="sm"
          style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
        >
          Tags provide flexible, cross-cutting categorization for your
          bookmarks. Unlike collections, a bookmark can have multiple tags, and
          tags work across collection boundaries.
        </Text>
      </Box>

      {/* Understanding Tags */}
      <Box>
        <Text
          fontSize="lg"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Understanding Tags
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
                Tags vs Collections
              </Text>
              <Box
                p={3}
                style={{ background: 'var(--color-bg-primary)' }}
                borderRadius="6px"
              >
                <VStack alignItems="stretch" gap={2}>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <strong>Collections:</strong> Hierarchical, folder-like
                    structure. Best for organizing by projects or broad
                    categories.
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <strong>Tags:</strong> Flat, flexible labels. Best for
                    cross-cutting themes, topics, or attributes.
                  </Text>
                </VStack>
              </Box>
              <Text
                fontSize="sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Pro tip: Use both for maximum organizational power!
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Adding Tags */}
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
          Adding Tags
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
                Manual Tagging
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
                    Click on any bookmark to open the edit dialog
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
                    Enter tags separated by commas (e.g., "react, tutorial,
                    javascript")
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
                    Tags auto-complete from your existing tags
                  </Text>
                </HStack>
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
                  [GIF: Adding tags to a bookmark]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Smart Tag Suggestions */}
      <Box
        p={1}
        style={{ background: 'var(--color-border)' }}
        borderRadius="8px"
      />

      <Box>
        <HStack gap={2} mb={3}>
          <LuSparkles size={20} color="var(--color-blue)" />
          <Text
            fontSize="lg"
            fontWeight="600"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Smart Tag Suggestions
          </Text>
        </HStack>

        <VStack alignItems="stretch" gap={4}>
          <Text
            fontSize="sm"
            style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
          >
            BookmarksX uses AI-powered NLP (Natural Language Processing) to
            analyze your bookmarks and suggest relevant tags automatically.
          </Text>

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
                How Smart Suggestions Work
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Domain Detection:</strong> Suggests tags based on
                  the website (e.g., "github" for github.com)
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>NLP Analysis:</strong> Extracts keywords from titles
                  and descriptions
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Pattern Learning:</strong> Learns from your existing
                  tagging patterns
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>URL Pattern Detection:</strong> Identifies common
                  URL patterns for tech sites
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
                  [GIF: Using smart tag suggestions]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Tag Filtering */}
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
          Filtering by Tags
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
                AND/OR Logic
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                When filtering by multiple tags, choose between:
              </Text>
              <Box
                p={3}
                style={{ background: 'var(--color-bg-primary)' }}
                borderRadius="6px"
              >
                <VStack alignItems="stretch" gap={2}>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <Code
                      fontSize="xs"
                      style={{
                        background: 'var(--color-bg-secondary)',
                        color: 'var(--color-blue)',
                        padding: '2px 6px',
                        marginRight: '8px',
                      }}
                    >
                      AND
                    </Code>
                    Show bookmarks with ALL selected tags
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <Code
                      fontSize="xs"
                      style={{
                        background: 'var(--color-bg-secondary)',
                        color: 'var(--color-blue)',
                        padding: '2px 6px',
                        marginRight: '8px',
                      }}
                    >
                      OR
                    </Code>
                    Show bookmarks with ANY selected tag
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Bulk Tagging */}
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
          Bulk Tagging
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
                Add Tags to Multiple Bookmarks
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Select multiple bookmarks using checkboxes, then click "Bulk
                Tag" to add or remove tags from all selected bookmarks at once.
                Perfect for organizing large imports!
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
                  [GIF: Bulk tagging operation]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Tag Manager */}
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
          Tag Manager
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
                Centralized Tag Management
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Access the Tag Manager from Settings to view all tags, see usage
                counts, rename tags, merge similar tags, or delete unused tags.
                Perfect for keeping your tag system organized!
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
            <Alert.Title>Best Practices for Tags</Alert.Title>
            <Alert.Description>
              <VStack alignItems="stretch" gap={2}>
                <Text fontSize="sm" lineHeight="1.6">
                  • Keep tags short and consistent (lowercase recommended)
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Use specific tags for better filtering ("react-hooks" vs
                  "react")
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Create a tagging system early (topic, priority, status)
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Regularly review and merge duplicate or similar tags
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Combine tags with collections for powerful organization
                </Text>
              </VStack>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>
    </VStack>
  )
}
